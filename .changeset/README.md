# Changesets

## What is this?

Changesets is a tool for managing and versioning code changes.
It helps keep track of what changed between releases to make changelogs and auto-generated release notes.
You can find the full documentation for it [in our repository](https://github.com/changesets/changesets).

## How to write a changeset

1. Create a new file in the `.changesets` folder with the name of the package you want to change (use random human readable names by default for these files to avoid collisions when generating them. e.g., `happy-sock-monster.md`).
2. Add all affected packages to markdown metadata (front matter) using the format "PACKAGE_NAME": VERSION_TAG (e.g., `"@equinor/fusion-query": patch`).
3. Write a brief description of the change(s).
4. Add sections for each package that was changed.
5. Explain in detailed why and what changes made to the package.
6. Explain in detail how a consumer should update their code
7. [optional] Include code blocks with examples of how to use new features or migrate breaking changes.
8. [optional] Include mermaid diagrams to illustrate the flow of the change.


**When deciding on a version tag, consider:**

* `major` version when making incompatible library changes
* `minor` version when adding functionality in a backward compatible manner
* `patch` version when making backward compatible bug fixes

## Example

```md
---
"@equinor/fusion-query": patch
"@equinor/fusion-react": minor
---

## @equinor/fusion-query

Changed functionality of `Query.query` to accept a new argument `invalidate`.

## @equinor/fusion-react
Added a new feature...
```
