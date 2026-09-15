const { context } = require("@actions/github");
const core = require("@actions/core");

import {validateCommitMessage, isWIP, getSemverLevel, SemverLevel} from "./isValidCommitMesage";
import extractCommits from "./extractCommits";

type Result = {sha?: string, header: string, level: string, reason?: string};

function setOutputs(semverLevel: SemverLevel, results: Result[]) {
    core.exportVariable('SEMVER_LEVEL', semverLevel.toString());
    core.setOutput('results', JSON.stringify(results));
}

async function run() {
    core.info(
        `ℹ️ Checking if commit messages are following the Flowing Code Commit Message Guidelines...`
    );

    // action.yml supplies the default whenever the action is called as one, so the input
    // is absent only when the bundle runs outside Actions, and the fallback is for that
    // alone. A value that is present but empty was written by the caller — an unset
    // workflow input interpolated into it, say — and is an error like any other value
    // that is neither true nor false, rather than silently the default.
    const input = process.env.INPUT_ENFORCE;
    const value = input === undefined ? 'true' : input.trim();
    if (value !== 'true' && value !== 'false') {
        setOutputs(0, []);
        core.setFailed(
            `🚫 The enforce input must be true or false, not "${value}".`
        );
        return;
    }

    /** Whether this action reports the outcome and fails on what it found. When false,
        it only produces outputs, and the caller is expected to report the outcome. */
    const enforce = value === 'true';

    let extractedCommits;
    try {
        extractedCommits = await extractCommits(context, core.getInput('token'));
    } catch (error) {
        // Reporting is left to the caller only for the outcome of the analysis.
        // Not being able to analyse anything is a failure of the action itself.
        setOutputs(0, []);
        core.setFailed(
            `🚫 The commit messages could not be checked: ${error instanceof Error ? error.message : error}`
        );
        return;
    }

    let semverLevel : SemverLevel = 0;
    let hasErrors = false;
    let hasWIP = false;
    const results : Result[] = [];
    core.startGroup("Commit messages:");
    for (let i = 0; i < extractedCommits.length; i++) {
        let commit = extractedCommits[i];
        const header = commit.message.split('\n')[0];
        const sha = commit.sha;
        
        let errmsg = validateCommitMessage(commit.message);
        if (errmsg === null) {
            const commitSemverLevel = getSemverLevel(commit.message);
            if (commitSemverLevel>semverLevel) semverLevel=commitSemverLevel;
            if (isWIP(commit.message)) {
                hasWIP = true;
                results.push({sha, header, level: 'wip'});
                core.info(`🚧 ${commit.message}`);
            } else {
                results.push({sha, header, level: 'valid'});
                core.info(`✅ ${commit.message}`);
            }
        } else {
            results.push({sha, header, level: 'invalid', reason: errmsg});
            hasErrors = true;
            // When this action reports, core.error creates an annotation on the check
            // run, so the offending commit is visible on the pull request itself.
            const digest = sha ? `${sha.substring(0, 7)} ` : '';
            const line = `🚩 ${digest}${header} : ${errmsg}`;
            if (enforce) core.error(line); else core.info(line);
        }
    }
    core.endGroup();

    setOutputs(semverLevel, results);
    
    if (!enforce) return;

    if (hasErrors) {
        core.setFailed(
            `🚫 According to the Flowing Code Commit Message Guidelines, some of the commit messages are not valid.`
        );
    } else if (hasWIP) {
        // A WIP commit must not be merged, and a step cannot both block the merge and
        // avoid the red X: that needs a check run of its own, which only a caller can
        // create. So the action keeps failing, and a caller that reports WIP for itself
        // asks for enforce: false rather than being handed a green check by default.
        core.setFailed(
            `🚧 Work-in-Progress (WIP) commits found. They must be squashed before rebasing or merging.`
        );
    } else if (extractedCommits.length === 0) {
        core.info(`No commits to check, skipping...`);
    } else {
        core.info("🎉 All commit messages are following the Flowing Code Commit Message Guidelines.");
    }
}

run();
