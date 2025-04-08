# GitHub Copilot Instructions

## Commit Messages

Use conventional commits to ensure that their commit messages are structured and meaningful.

```md
<type>(<scope>): <description>

[body]

[footer(s)]
```

**Type**:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

**Scope** _[optional]_: 

Optionally, specify the scope of the change. This could be the name of the module, component, or file affected.

**Description**:

Write a short, imperative tense description of the change.

**Body** _[optional]_: 

Provide a more detailed description of the change if necessary.

**Footer** _[optional]_: 

Include any information about Breaking Changes and reference issues that this commit closes.



## Pull Requests
```md
## Why
<!-- What kind of change does this PR introduce? -->
<!-- What is the current behavior? -->
<!-- What is the new behavior? -->
<!-- Does this PR introduce a breaking change? -->
<!-- Other information? -->

closes: <!-- [optional] issue number(s) this PR closes -->


### Check off the following:
- [ ] Confirm that I checked changes to branch which I am merging into.
  - _I have validated included files_
  - _My code does not generate new linting warnings_
  - _My PR is not a duplicate, [check existing pr`s](https://github.com/equinor/fusion-framework/pulls)_
- [ ] Confirm that the I have completed the [self-review checklist](https://github.com/equinor/fusion-framework/blob/main/contributing/self-review.md).

- [ ] Confirm that my changes meet our [code of conduct](https://github.com/equinor/fusion-framework/blob/main/CODE_OF_CONDUCT.md).
```

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