# Contributing to Fusion Lint

Thank you for your interest in contributing! This extension is part of the
[Fusion Framework](https://github.com/equinor/fusion-framework) monorepo.

All issues, pull requests, and discussions live there.

## Reporting issues

Open an issue in the [fusion-framework](https://github.com/equinor/fusion-framework/issues)
repository. Please include:

- VS Code version
- Extension version (shown in the Extensions panel)
- A minimal code sample that reproduces the diagnostic (or the lack of one)
- The contents of the **Output → Fusion Lint** channel if the server crashed

## Development setup

```sh
git clone https://github.com/equinor/fusion-framework.git
cd fusion-framework
pnpm install
```

The extension lives at `packages/linting/vscode/`. The lint engine and rules
are in `packages/linting/rules/` and the LSP server in `packages/linting/lsp/`.

### Build and run locally

```sh
# Full build (rules → server → extension)
cd packages/linting/core  && pnpm build
cd packages/linting/rules && pnpm build
cd packages/linting/lsp   && pnpm build
cd packages/linting/vscode && pnpm build

# Package as VSIX
pnpm package

# Install into VS Code
code --install-extension fusion-lint-vscode-*.vsix
```

Open `packages/linting/vscode` in VS Code and press **F5** to launch an
Extension Development Host with live reload.

### Adding a rule

1. Create `packages/linting/rules/src/<rule-name>/index.ts` implementing the
   `Rule` interface from `@equinor/fusion-framework-lint-core`.
2. Export it from `packages/linting/rules/src/index.ts`.
3. Add tests in `packages/linting/rules/src/__tests__/<rule-name>.test.ts`.
4. Register it in `packages/linting/config/src/defaults.ts`.

## Code style

This project uses [Biome](https://biomejs.dev/) for formatting and linting.
Run `pnpm lint` and `pnpm format` before submitting a PR.

## License

By contributing you agree that your work will be licensed under the
[MIT License](./LICENSE) that covers this project.
