# @equinor/fusion-framework-lint-lsp

LSP language server for the Fusion Framework linter. Provides real-time diagnostics as you type — the same rules as `fusion-lint` in your terminal, delivered as squiggles in any LSP-compatible editor.

## When to use this package

- You want live Fusion lint diagnostics in VS Code, Neovim, Zed, Cursor, OpenCode, Helix, or any other editor that supports the Language Server Protocol.
- You want one server binary that works everywhere, not a per-editor plugin.
- You are building an editor integration and need a standalone `fusion-lint-server` process to connect to.

## How it works

`fusion-lint-server` is a Node.js process that speaks the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) over `stdio`. Editors connect to it and receive diagnostics on every keystroke.

```
editor  ──(LSP/stdio)──  fusion-lint-server  ──  LintEngine + loadLintConfig
```

On startup the server searches for a `fusion-lint.config.*` or `.fusion-lintrc.*` file in the workspace root and loads it — the same config discovery used by the `fusion-lint` CLI. Built-in rules and any custom rules registered in the config file are all available in the editor.

## Installation

```sh
pnpm add -g @equinor/fusion-framework-lint-lsp
# or
npm install -g @equinor/fusion-framework-lint-lsp
```

Verify the binary is on your `PATH`:

```sh
fusion-lint-server --version
```

## Connecting an editor

Point your editor at the server binary using `stdio` transport. Replace `fusion-lint-server` with an absolute path if the binary is not on your `PATH`.

### VS Code

Install the companion extension (`fusion-lint-vscode`). It handles the connection automatically. See [packages/linting/vscode](../vscode/README.md).

### Neovim (nvim-lspconfig)

```lua
require('lspconfig').fusion_lint.setup({
  cmd = { 'fusion-lint-server', '--stdio' },
  filetypes = { 'typescript', 'typescriptreact' },
  root_dir = require('lspconfig.util').root_pattern(
    'fusion-lint.config.ts',
    'fusion-lint.config.json',
    '.fusion-lintrc.yml',
    'package.json'
  ),
})
```

### Zed

Add to `settings.json`:

```json
{
  "lsp": {
    "fusion-lint": {
      "binary": {
        "path": "fusion-lint-server",
        "arguments": ["--stdio"]
      }
    }
  }
}
```

### OpenCode / other LSP clients

```json
{
  "servers": {
    "fusion-lint": {
      "command": "fusion-lint-server",
      "args": ["--stdio"],
      "filetypes": ["typescript", "typescriptreact"]
    }
  }
}
```

## Config file

The server loads `fusion-lint.config.ts`, `fusion-lint.config.json`, `.fusion-lintrc.yml`, or any other format supported by `@equinor/fusion-framework-lint-config`. See that package's README for the full config API including `defineConfig`, `ConfigBuilder`, `addRule`, `configureRule`, and `removeRule`.

```ts
// fusion-lint.config.ts
import { defineConfig } from '@equinor/fusion-framework-lint-config';

export default defineConfig((args) => {
  args.recommended = true;
  args.configureRule('require-tsdoc', (rule) => { rule.severity = 'error'; });
});
```

Changes to the config file take effect the next time a document is opened or changed. In VS Code (using the companion extension), the client also watches for config file changes and reloads automatically.

## Diagnostics

Each diagnostic published by the server includes:

| Field | Value |
|---|---|
| `source` | `"fusion-lint"` |
| `code` | Rule ID (e.g. `require-tsdoc`) |
| `severity` | `Error` or `Warning` |
| `message` | Rule-specific message |
| `range` | Start position of the offending node |

## Development

Build the server from source:

```sh
cd packages/linting/lsp
pnpm build          # compiles TypeScript to dist/esm/
```

Run the compiled binary directly:

```sh
node bin/fusion-lint-server.mjs --stdio
```

To test against a real editor, set the server path in your editor config to the absolute path of `bin/fusion-lint-server.mjs` and open a TypeScript file.
