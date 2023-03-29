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
    
### Semantic Versioning 

After the action completes, the `SEMVER_LEVEL` environment variable is set according to the highest level of [Semantic Versioning](https://semver.org/spec/v2.0.0.html) change described by the commit messages:

|Level|Value|Commit types|
|---|---|----------------|
|MAJOR|3| breaking changes (!), `remove`
|MINOR|2| `feat`, `deprecate` 
|PATCH|1| `fix`, `refactor`, `build`, `perf`, `chore`
|NONE |0| `ci`, `style`, `docs`, `test`, `revert`*
    
&nbsp;* `revert` is classified as NONE because the level of semantic versioning change cannot be decided from the commit message alone.

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
