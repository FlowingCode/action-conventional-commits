# Flowing Code Conventional Commits GitHub Action

A simple GitHub action that makes sure all commit messages are following the [Flowing Code Commit Message Guidelines](https://github.com/FlowingCode/DevelopmentConventions/blob/main/conventional-commits.md), 
based on the Conventional Commits specification.

![Screenshot](/docs/screenshot.png)

Note that, typically, you would make this check on a pre-commit hook (for example, using something like [Commitlint](https://commitlint.js.org/)), but those can easily be skipped, hence this GitHub action.

### Validation Rules
- The commit message must contain at least a type and a subject (`type:subject`), with an optional scope (`type(scope):subject`)
- The commit type must be one of `feat`, `fix`, `remove`, `deprecate`, `refactor`, `build`, `perf`, `chore`, `ci`, `style`, `docs`, `test`, `revert`
- The first line of the commit message must not exceed 72 characters.	
- Commit type must be all lowercase.
- Commit subject must start with lowercase.
- There must be a single space after the commit type.	
- Commits of type `revert:` must begin with the type of the reverted commit (e.g. `revert: feat: something`)
- Changes of type `deprecate:`, `test:`, `ci:`, `style:` and `docs:` must not be breaking.
- Commits of type `remove:` must be breaking changes (i.e. `remove!: something`)
    
### Work in Progress

Commits of type `WIP` are valid, but they must be squashed before rebasing or merging.

By default a WIP commit fails the check. That blocks the merge, but it marks the pull
request as failing, and an unfinished branch is an expected state rather than an error. A
check run of its own, concluding `action_required`, blocks the merge without the failure;
only the workflow can create one, so `enforce: false` leaves that reporting to the caller.

|Name|Type|Description|
|---|---|---|
|`enforce`|input|Whether the action reports the outcome and fails on what it found, WIP commits included (default `true`). With `false` it only produces outputs. Any value other than `true` or `false` is an error|
|`results`|output|The result for every commit, as a JSON array of `{sha, header, level, reason}`, where `level` is `valid`, `wip` or `invalid`|

With `enforce: false` the action only analyzes: it does not fail on what it found in the
commits and writes no annotations, and the caller reports the outcome from `results`. That
covers invalid commit messages as much as WIP commits: both are in `results`, and both then
need a conclusion from the caller.

`results` is set on every path, and before the check fails, so it is available whatever the
outcome. If the commit messages cannot be retrieved it is an empty array, and the action
fails on that path even with `enforce: false`, so a caller tells it apart from a pull request
with no findings by the outcome of the step rather than by the output.

### Semantic Versioning 

After the action completes, the `SEMVER_LEVEL` environment variable is set according to the highest level of [Semantic Versioning](https://semver.org/spec/v2.0.0.html) change described by the commit messages:

|Level|Value|Commit types|
|---|---|----------------|
|MAJOR|3| breaking changes (!), `remove`
|MINOR|2| `feat`, `deprecate` 
|PATCH|1| `fix`, `refactor`, `build`, `perf`, `chore`
|NONE |0| `ci`, `style`, `docs`, `test`, `revert`, `WIP`*
    
&nbsp;* `revert` and `WIP` are classified as NONE because the level of semantic versioning change cannot be decided from the commit message alone.

### Token

The commits of a pull request are read through the GitHub API, and the request carries the
token of the workflow by default, so nothing has to be configured:

|Name|Type|Description|
|---|---|---|
|`token`|input|The token used to read the commits of a pull request (default `${{ github.token }}`)|

Setting it to an empty string reads them anonymously, which GitHub limits to 60 requests per
hour per IP address, shared with every other job running on that address, and which cannot
read a private repository at all. The action warns when it does.

### Usage
Latest version: `v1.1.0`

```yml
name: Conventional Commits

on:
  pull_request:
    branches: [ master ]

jobs:
  build:
    name: Conventional Commits
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - uses: webiny/action-conventional-commits@v1.1.0
```
