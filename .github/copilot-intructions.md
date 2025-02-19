# GitHub Copilot Instructions

## Commit Messages
- Follow the guidelines in `contributing/conventional-commits.md`.

## Pull Requests
- Use `git diff --merge-base <target_branch>`.
- Analyze and generate content from diff.
- Use the template in `.github/PULL_REQUEST_TEMPLATE.md`.
- Replace placeholder text with relevant information.

## Code Suggestions and Examples
- Include comments explaining the purpose of the code.
- Specify parameter and return types.
- Use Typedoc comments to document functions, classes, and interfaces.

## Preferred Language
- Write all code examples and suggestions in TypeScript.
- Use RxJS for asynchronous operations.

## Package Manager
- Use `pnpm` for installing dependencies and managing packages.

## Changesets
- Use `git diff --staged` to identify updated packages and the type of update (major, minor, or patch).
- Follow `contributing/changeset.md` and generate a changeset for each affected package.