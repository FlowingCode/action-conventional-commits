const { context } = require("@actions/github");
const core = require("@actions/core");

import {validateCommitMessage, getSemverLevel, SemverLevel} from "./isValidCommitMesage";
import extractCommits from "./extractCommits";

async function run() {
    core.info(
        `ℹ️ Checking if commit messages are following the Conventional Commits specification...`
    );

    const extractedCommits = await extractCommits(context);
    
    let semverLevel : SemverLevel = 0;
    let hasErrors = false;
    core.startGroup("Commit messages:");
    for (let i = 0; i < extractedCommits.length; i++) {
        let commit = extractedCommits[i];
        
        let errmsg = validateCommitMessage(commit.message);
        if (errmsg === null) {
            const commitSemverLevel = getSemverLevel(commit.message);
            if (commitSemverLevel>semverLevel) semverLevel=commitSemverLevel;
            core.info(`✅ ${commit.message}`);
        } else {
            core.info(`🚩 ${commit.message} : ${errmsg}`);
            hasErrors = true;
        }
    }
    core.endGroup();

    core.exportVariable('SEMVER_LEVEL', semverLevel.toString()); 
    
    if (hasErrors) {
        core.setFailed(
            `🚫 According to the conventional-commits specification, some of the commit messages are not valid.`
        );
    } else if (extractedCommits.length === 0) {
        core.info(`No commits to check, skipping...`);
    } else {
        core.info("🎉 All commit messages are following the Conventional Commits specification.");
    }
}

run();
