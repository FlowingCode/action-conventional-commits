const core = require("@actions/core");

import get from "lodash.get";
import got from "got";

type Commit = {
    message: string;
};

const extractCommits = async (context, token?: string): Promise<Commit[]> => {
    // For "push" events, commits can be found in the "context.payload.commits".
    const pushCommits = Array.isArray(get(context, "payload.commits"));
    if (pushCommits) {
        return context.payload.commits;
    }

    // For PRs, we need to get a list of commits via the GH API:
    const prCommitsUrl = get(context, "payload.pull_request.commits_url");
    if (prCommitsUrl) {
        if (!token) {
            core.warning(
                `⚠️ The commits of the pull request are being read anonymously, which GitHub rate limits per IP address and which cannot read a private repository. The token input is empty: unless that is deliberate, it is a mistake in the configuration.`
            );
        }

        // Failures are propagated rather than turned into an empty list: an empty
        // list is indistinguishable from a pull request whose commits are all valid.
        const { body } = await got.get(prCommitsUrl, {
            responseType: "json",
            headers: token ? { authorization: `Bearer ${token}` } : {},
        });

        if (!Array.isArray(body)) {
            throw new Error(`${prCommitsUrl} did not return a list of commits`);
        }
        return body.map((item) => item.commit);
    }

    return [];
};

export default extractCommits;
