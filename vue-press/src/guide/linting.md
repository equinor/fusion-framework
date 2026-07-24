---
title: Linting
category: Guide
tag:
  - lint
  - biome
---

# Linting

Fusion apps use two linters together, each catching different things:

- **[Biome](https://biomejs.dev/)** — general JavaScript/TypeScript formatting and correctness (unused variables, dead code, style)
- **[Fusion Lint](https://www.npmjs.com/package/@equinor/fusion-lint)** — Fusion Framework-specific conventions (intent comments on control flow, TSDoc on exported APIs, no class components, and more)

Run both, in that order — Biome catches general issues, Fusion Lint catches Fusion-specific ones.

[Install Fusion TS Lint in VS Code](vscode:extension/equinor-fusion.fusion-ts-lint-vscode) for inline squiggles as you type — no separate server to configure.

<!-- @include: ../../../packages/linting/README.md -->

## Biome

Biome formats and lints general JS/TS issues. A Fusion app's generated `biome.json` (via `@equinor/fusion-framework-cli`) is a good starting point — extend or copy it into your own project.

```jsonc
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.2.5/schema.json",
  "formatter": {
    "enabled": true,
    "lineWidth": 100,
    "indentStyle": "space"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "quoteStyle": "single"
    }
  }
}
```

Install the [Biome VS Code extension](vscode:extension/biomejs.biome) and set it as your default formatter:

```jsonc
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true
}
```

Useful commands once Biome is added to your `package.json` scripts:

| Command | What it does |
|---|---|
| `biome check` | Format + lint check (read-only) |
| `biome format --write` | Format files in place |
| `biome lint` | Lint only |
