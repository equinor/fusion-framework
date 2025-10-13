# Conventional Commits

Contributors should use conventional commits to ensure that their commit messages are structured and meaningful. By following these guidelines, you help reviewers and maintainers understand the train of thought behind changes and maintain a clean commit history.

## What is Conventional Commits?
Conventional Commits is a specification for writing commit messages that follow a certain format. 
This format allows for easier automation and understanding of the commit history. 
The basic structure of a Conventional Commit is:

```
<type>(<scope>): <description>

<body>

<footer>
```

## Commit Types

Choose the appropriate type based on the nature of your change:

| Type | Description | Release Impact |
|------|-------------|----------------|
| `feat` | A new feature or enhancement | Minor version bump |
| `fix` | A bug fix | Patch version bump |
| `docs` | Documentation changes only | No version bump |
| `style` | Code style changes (formatting, semicolons, etc.) | No version bump |
| `refactor` | Code restructuring without feature or fix changes | Patch version bump |
| `test` | Adding or correcting tests | No version bump |
| `chore` | Build process, tooling, or auxiliary changes | No version bump |
| `perf` | Performance improvements | Patch version bump |
| `ci` | CI/CD pipeline changes | No version bump |
| `build` | Build system or dependency changes | No version bump |

### Scope (Optional)

Specify the scope to indicate which part of the codebase is affected. For this monorepo, derive the scope from the package name by removing the `@equinor/fusion-framework-` prefix:

- `@equinor/fusion-framework` → `framework`
- `@equinor/fusion-framework-react` → `react`
- `@equinor/fusion-framework-module-http` → `module-http`
- `@equinor/fusion-framework-cli` → `cli`
- `@equinor/fusion-query` → `query`

Use the most specific scope that applies to your changes. For cross-cutting changes, omit the scope entirely.

### Description

- **Imperative mood**: "Add feature" not "Added feature"
- **Concise**: Keep under 72 characters
- **Clear**: Explain what changed, not how

### Body (Optional)

- Provide additional context or rationale
- Explain complex changes or trade-offs
- Reference related commits or discussions

### Footer (Optional)

- **Breaking changes**: Start with `BREAKING CHANGE:`
- **Issue references**: `Closes #123`, `Fixes #456`, `Refs #789`
- **Co-authors**: `Co-authored-by: Name <email>`

## Examples

### Feature Addition
```
feat(react-app): add useQuery hook for data fetching

Implement a new React hook that provides a consistent API for data fetching
with loading states, error handling, and caching support.

Closes #123
```

### Bug Fix with Breaking Change
```
fix(module-http): handle timeout errors in request interceptor

BREAKING CHANGE: Timeout errors now throw HttpError instances instead of
generic Error objects. Update error handling code accordingly.

Previously, timeout errors were not properly caught in the request interceptor,
causing unhandled promise rejections.
```

## Project-Specific Guidelines

### Commit Standards

This project follows conventional commit standards. While commitlint configuration is available for local development, commits are validated through the [self-review checklist](./self-review.md).

### Integration with Changesets

Conventional commits work alongside our [changeset](changeset.md) system for versioning. While commits help reviewers and maintainers understand the train of thought, changesets create consumer-facing change logs that document what changed in each release.

### Self-Review Checklist

Before submitting a PR, ensure your commits:
- [ ] Follow conventional commit format
- [ ] Have clear, imperative descriptions
- [ ] Include breaking change notices when applicable
- [ ] Reference related issues
- [ ] Maintain linear git history (use `git rebase`)

## AI Contributor Guidelines

When AI tools generate commits:

1. **Analyze changes first**: Understand what actually changed before writing the commit message
2. **Use appropriate scope**: Reference specific packages/modules affected
3. **Be specific**: Avoid generic messages like "update code" - explain what was updated and why
4. **Check for breaking changes**: Look for API changes, removed exports, or behavioral changes
5. **Reference issues**: Include issue numbers when mentioned in PR descriptions or code comments
6. **Follow project patterns**: Review recent commits to match the project's style and detail level

## Why Conventional Commits Matter

- **Internal Communication**: Helps reviewers and maintainers understand the train of thought behind changes
- **Consistency**: Maintains uniform commit history across the project
- **Clarity**: Makes change history easily understandable for future contributors
- **Tool Integration**: Works seamlessly with GitHub and other development tools
- **Collaboration**: Enables better code reviews and knowledge sharing among team members

## Quick Reference

**Valid commit message:**
```
feat(http): add retry logic to failed requests

Implement exponential backoff retry mechanism for HTTP requests that fail
due to network issues.

Closes #789
```

**Invalid commit message:**
```
updated http stuff
```

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)
- [Semantic Versioning](https://semver.org/)
- [Changesets Documentation](changeset.md)
- [Commitizen](https://github.com/commitizen/cz-cli) - Interactive commit message tool

