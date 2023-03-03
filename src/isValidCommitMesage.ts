const DEFAULT_COMMIT_TYPES = [
    "feat",
    "fix",
    "perf",
    "refactor",
    "deprecate",
    "remove",
    "test",
    "build",
    "ci",
    "docs",
    "style",
    "revert",
    "chore"
];

/** types that never correlate with a semantic versioning change*/
const NONE_COMMIT_TYPES = [
    "style",
    "ci",
    "test",
];

/** types that never correlate with a MAJOR semantic versioning change*/
const NOT_BREAKING_COMMIT_TYPES = [
    "docs",
    "deprecate",
].concat(NONE_COMMIT_TYPES);

/** types that correlates with MINOR in semantic versioning */
const MINOR_COMMIT_TYPES = [
    "feat",
    "deprecate"
];

/** types that correlates with MAJOR in semantic versioning */
const MAJOR_COMMIT_TYPES = [
    "remove",
];

export type SemverLevel = 0 | 1 | 2 | 3;

export const validateCommitMessage = (message): string | null => {
    
    let [header] = message.split('\n');
    
    if (!/^\w+(\(\S+?\))?(!?): .+$/.test(header)) {
        return "The commit header is not formatted according to Conventional Commits.";
    }
    
    if (header.length >= 72) {
        return "The length of the header line (including type and scope) must be less than 72 characters";
    }

    let [commitType, subject] = [header.substring(0,header.indexOf(':')), header.substring(header.indexOf(':')+1)];
    
    if (subject.endsWith('.')) {
        return "The last character of the commit subject must not be a dot";
    }
    
    if (/^\S/.test(subject)) {
        return "There must be a space after type:";
    }

    if (/^\s\s/.test(subject)) {
        return "There must be a single space after type:";
    }

    if (/^\s[A-Z]/.test(subject)) {
        return "Don't capitalize the first letter of the commit subject";
    }
    
    // Let's remove scope if present.
    if (commitType.match(/\(\S+?\)/)) {
        commitType = commitType.replace(/\(\S+?\)/, "");
    }

    // Remove bang for notify breaking change
    const breaking = commitType.endsWith('!');
    if (breaking) {
        commitType = commitType.substring(0, commitType.length-1)
    }
    
    if (commitType=="revert" && subject.indexOf(':')<=0) {
        return "The commit subject must begin with the type of the reverted commit, followed by the subject of the reverted commit.";
    }
        
    if (!DEFAULT_COMMIT_TYPES.includes(commitType)) {
        if (DEFAULT_COMMIT_TYPES.includes(commitType.toLowerCase())) {
          return "The commit of type must be in lowercase";
        } else {
          return `Invalid commit of type '${commitType}'`;
        }
    }
    
    if (breaking && NOT_BREAKING_COMMIT_TYPES.includes(commitType)) {
        // the commit type never correlates with a MAJOR semantic versioning change
        return `A commit of type '${commitType}' must not be a breaking change`;
    }
    
    if (!breaking && MAJOR_COMMIT_TYPES.includes(commitType)) {
        // the commit type never correlates with a MAJOR semantic versioning change
        return `A commit of type '${commitType}' must be a breaking change`;
    }

    return null;
};

export const getSemverLevel = (message): SemverLevel => {
    //precondition: message must be a valid commit message
    
    let [commitType] = message.split(":");
    
    if (commitType.endsWith("!")) {
        return 3;
    }
    
    const match = commitType.match(/(\w+)(\(\S*?\))?/);
    if (match[2]=="demo") {
        //this is a hardcoded exception because we ignore semver when scope is "demo" 🤷‍
        return 0;
    } else {
        //otherwise, ignore scope
        commitType = match[1];
    }
    
    if (commitType=="revert") {
        // the level of semantic versioning change cannot be decided from the commit message alone
        return 0;
    }
    
    if (NONE_COMMIT_TYPES.includes(commitType)) {
        // the commit type never correlates with a semantic versioning change
        return 0;
    }
    
    if (MINOR_COMMIT_TYPES.includes(commitType)) {
        // the commit type correlates with a MINOR semantic versioning change
        return 2;
    }
    
    if (MAJOR_COMMIT_TYPES.includes(commitType)) {
        // the commit type correlates with a MAJOR semantic versioning change
        return 3;
    }
    
    // other commit types correlate with a PATCH semantic versioning change
    return 1;
}
