---
title: Setup
category: Guide
tag:
  - pnpm
  - setup
---

# Setup

Recommended tooling for a Fusion app project, beyond scaffolding it with [`ffc create app`](/cli/docs/creating-apps.md).

## Package manager: pnpm

Fusion Framework apps use [pnpm](https://pnpm.io/). Use it for installs and scripts instead of `npm` or `yarn` — it's faster, and workspace-linked packages (`workspace:^`) only resolve correctly with pnpm.

```sh
# Install pnpm if you don't have it
corepack enable
corepack prepare pnpm@latest --activate

# Install dependencies
pnpm install

# Run a script
pnpm dev
pnpm build
```

If your project is a monorepo with multiple apps/packages, declare them in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## TypeScript

Fusion Framework packages ship strict TypeScript types. Keep `strict: true` in your `tsconfig.json` — Fusion's APIs are designed around it, and turning it off will surface `any`-typed gaps in your own code instead of the framework's.

## Linting and formatting

See [Linting](linting.md) for setting up [Biome](https://biomejs.dev/) and [Fusion Lint](https://www.npmjs.com/package/@equinor/fusion-lint) — both are recommended for any Fusion app.

## Testing

Fusion Framework uses [Vitest](https://vitest.dev/) and provides a thin integration for
testing React apps in Vitest Browser Mode. The integration initializes the real application
module scope and deterministic Fusion boundaries; Vitest continues to own the runner,
assertions, hooks, configuration, and general-purpose mocking.

See [Testing Fusion apps](testing/) for choosing a test layer and
[Getting started with app tests](testing/getting-started.md) for the browser configuration,
first passing test, and CI command. Use the official [Vitest documentation](https://vitest.dev/guide/)
for runner features that are not Fusion-specific.

## Editor

Install the [Fusion TS Lint](vscode:extension/equinor-fusion.fusion-ts-lint-vscode) and [Biome](vscode:extension/biomejs.biome) VS Code extensions, and set Biome as your default formatter:

```jsonc
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true
}
```
