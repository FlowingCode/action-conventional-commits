const core = require("@actions/core");

import get from "lodash.get";
import got from "got";

type Commit = {
    message: string;
    sha?: string;
};

/** The URL of the next page, taken from the Link header of a response. */
const nextPage = (link): string | null => {
    const match = /<([^>]+)>;\s*rel="next"/.exec(String(link || ""));
    return match ? match[1] : null;
};

/** Reads the commits of a pull request, following the pages of the response. The
    page holds 30 commits unless a size is asked for, and only the first page was
    read, so the commits of a longer pull request went unchecked. */
const readCommits = async (prCommitsUrl: string, token?: string) => {
    const items = [];
    let url = `${prCommitsUrl}?per_page=100`;

    while (url) {
        // Failures are propagated rather than turned into an empty list: an empty
        // list is indistinguishable from a pull request whose commits are all valid.
        const { body, headers } = await got.get(url, {
            responseType: "json",
            headers: token ? { authorization: `Bearer ${token}` } : {},
        });

        if (!Array.isArray(body)) {
            throw new Error(`${url} did not return a list of commits`);
        }
        items.push(...body);
        url = nextPage(headers["link"]);
    }

    return items;
};

const extractCommits = async (context, token?: string): Promise<Commit[]> => {
    // For "push" events, commits can be found in the "context.payload.commits".
    const pushCommits = Array.isArray(get(context, "payload.commits"));
    if (pushCommits) {
        core.info(`ℹ️ Read ${context.payload.commits.length} commit(s) from the push payload.`);
        return context.payload.commits.map((commit) => ({message: commit.message, sha: commit.id}));
    }

    // For PRs, we need to get a list of commits via the GH API:
    const prCommitsUrl = get(context, "payload.pull_request.commits_url");
    if (prCommitsUrl) {
        if (!token) {
            core.warning(
                `⚠️ The commits of the pull request are being read anonymously, which GitHub rate limits per IP address and which cannot read a private repository. The token input is empty: unless that is deliberate, it is a mistake in the configuration.`
            );
        }

        const items = await readCommits(prCommitsUrl, token);
        core.info(`ℹ️ Read ${items.length} commit(s) from the pull request.`);
        return items.map((item) => ({message: item.commit.message, sha: item.sha}));
    }

    // Neither a push nor a pull request: there is nothing to read, and saying which event
    // it was keeps this apart from a push or a pull request that carries no commits.
    core.info(`ℹ️ No commits to check: the "${context.eventName}" event has neither a push payload nor a pull request.`);
    return [];
};

export default extractCommits;
