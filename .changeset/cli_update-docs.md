---
"@equinor/fusion-framework-cli": patch
---

- Removed all YAML/Markdown frontmatter blocks from CLI documentation files in `/packages/cli/docs` and `/packages/cli/README.md` for a cleaner, more maintainable documentation source.
- Updated all internal documentation links to use relative paths without leading `./` for consistency and compatibility with VuePress.
- Updated the `TODO.md` file to remove completed or obsolete tasks and clarify remaining todos.
