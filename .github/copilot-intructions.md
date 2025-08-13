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
- All new code should be type-safe and avoid using any.

## Package Manager
- Use `pnpm` for installing dependencies and managing packages.


## Changesets

When generating a changeset for this repository, always follow these guidelines:

1. **One Package per Changeset**: Each changeset should ideally affect only one package. If multiple packages are changed, clearly separate their sections.
2. **Use Correct Front Matter**: At the top of the changeset, specify each affected package and the type of version bump (`major`, `minor`, or `patch`) using the format:
  ```
  ---
  "@equinor/package-name": patch
  ---
  ```
  - __Important:__ In this monorepo, always determine the correct package name by reading the `name` field from the relevant `package.json` file of the affected package.
1. **Clear, Concise Summary**: Write a brief, descriptive summary of the change. Focus on what changed and why.
2. **Detailed Explanation**: For each package, provide:
  - What was changed and why.
  - How the change affects consumers.
  - Migration instructions if there are breaking changes.
  - Example code blocks for new features or usage changes.
3. **Semantic Versioning**: Choose the version bump type based on the impact:
  - `major`: Breaking/incompatible changes.
  - `minor`: Backward-compatible new features.
  - `patch`: Backward-compatible bug fixes.
4. **Formatting**:
  - Use Markdown for formatting.
  - Use code blocks for examples.
  - Use bullet points for lists of changes.

5. **No Unrelated Changes**: Do not group unrelated changes in a single changeset.
6. **Example Template**:
  ```
  ---
  "@equinor/fusion-query": minor
  ---

  **@equinor/fusion-query:**

  - Added support for the `invalidate` argument in `Query.query`.
  - Consumers can now force query invalidation before execution.

  ```ts
  // Example usage
  query.query({ invalidate: true });
  ```

  _No breaking changes. No migration required._
  ```
9. **Location**: Place the changeset in the `.changesets` directory with a unique, human-readable filename.

Refer to `contributing/changeset.md` for more details and best practices.