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

    let extractedCommits;
    try {
        extractedCommits = await extractCommits(context, core.getInput('token'));
    } catch (error) {
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
            // core.error creates an annotation on the check run, so the offending
            // commit and the reason are visible on the pull request itself.
            const digest = sha ? `${sha.substring(0, 7)} ` : '';
            core.error(`🚩 ${digest}${header} : ${errmsg}`);
        }
    }
    core.endGroup();

    setOutputs(semverLevel, results);
    
    if (hasErrors) {
        core.setFailed(
            `🚫 According to the Flowing Code Commit Message Guidelines, some of the commit messages are not valid.`
        );
    } else if (hasWIP) {
        core.setFailed(`🚧 Work-in-Progress (WIP) commits found.`);
    } else if (extractedCommits.length === 0) {
        core.info(`No commits to check, skipping...`);
    } else {
        core.info("🎉 All commit messages are following the Flowing Code Commit Message Guidelines.");
    }
}

run();
