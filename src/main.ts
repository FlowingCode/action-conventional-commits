const { context } = require("@actions/github");
const core = require("@actions/core");

import {validateCommitMessage, isWIP, getSemverLevel, SemverLevel} from "./isValidCommitMesage";
import extractCommits from "./extractCommits";

async function run() {
    core.info(
        `ℹ️ Checking if commit messages are following the Flowing Code Commit Message Guidelines...`
    );

    let extractedCommits;
    try {
        extractedCommits = await extractCommits(context);
    } catch (error) {
        // Not being able to analyse anything is a failure of the action itself.
        // SEMVER_LEVEL is exported nonetheless, so that a later step reading it
        // does not read an empty value.
        core.exportVariable('SEMVER_LEVEL', '0');
        core.setFailed(
            `🚫 The commit messages could not be checked: ${error instanceof Error ? error.message : error}`
        );
        return;
    }
    
    let semverLevel : SemverLevel = 0;
    let hasErrors = false;
    let hasWIP = false;
    core.startGroup("Commit messages:");
    for (let i = 0; i < extractedCommits.length; i++) {
        let commit = extractedCommits[i];
        
        let errmsg = validateCommitMessage(commit.message);
        if (errmsg === null) {
            const commitSemverLevel = getSemverLevel(commit.message);
            if (commitSemverLevel>semverLevel) semverLevel=commitSemverLevel;
            if (isWIP(commit.message)) {
                hasWIP = true;
                core.info(`🚧 ${commit.message}`);
            } else {
                core.info(`✅ ${commit.message}`);
            }
        } else {
            core.info(`🚩 ${commit.message} : ${errmsg}`);
            hasErrors = true;
        }
    }
    core.endGroup();

    core.exportVariable('SEMVER_LEVEL', semverLevel.toString()); 
    
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
