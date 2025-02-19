# GitHub Copilot Instructions

## Commit Messages
- Conform to `contributing/conventional-commits.md`.

## Pull Request
- Use template `.github/PULL_REQUEST_TEMPLATE.md`.
- Replace the placeholder text with the relevant information.

## Code Suggestions and Examples
- Use code comments to explain the purpose of the code.
- Use proper parameter and return types.
- Use typedoc comments to document functions, classes, and interfaces.

## Preferred Language
- All code examples and suggestions should be written in TypeScript.
- Prefer using RxJS for handling asynchronous operations.

## Package Manager
- Always use `pnpm` as the package manager for installing dependencies and managing packages.

## Changesets
- Use `git diff --staged` to resolve which packages have been updated and the type of update (major, minor, or patch).
- Conform to `contributing/changeset.md` and generate a changeset for each affected package.