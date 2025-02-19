# Conventional Commits

Contributors should use conventional commits to ensure that their commit messages are structured and meaningful. By following these guidelines, you help us maintain a clean and understandable commit history.

## What is Conventional Commits?
Conventional Commits is a specification for writing commit messages that follow a certain format. 
This format allows for easier automation and understanding of the commit history. 
The basic structure of a Conventional Commit is:

```
<type>(<scope>): <description>

[body]

[footer(s)]
```

**Type**: 

Choose the type of change you are making. Common types include:

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

## Why Use Conventional Commits?
- **Consistency**: Ensures a consistent commit message format across the project.
- **Automation**: Facilitates automated release notes generation, versioning, and changelog creation.
- **Clarity**: Makes it easier to understand the history of changes and the purpose of each commit.
- **Collaboration**: Helps new contributors understand the project's history and the context of changes.

## References
- [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)
- [Semantic Versioning](https://semver.org/)
- [Commitizen](https://github.com/commitizen/cz-cli) - A tool to help you write Conventional Commits

