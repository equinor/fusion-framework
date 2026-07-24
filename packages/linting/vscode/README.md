# Fusion Lint

**Fusion Framework lint diagnostics inside VS Code — inline squiggles, Problems
panel entries, and hover messages as you type.**

The language server is bundled inside the extension. Nothing extra to install.

---

## Features

- **Real-time diagnostics** on every save (and as you type)
- **Inline squiggles** with hover messages explaining each violation
- **Problems panel** integration — click to jump to the offending line
- **Zero configuration** — sensible defaults out of the box
- **Self-contained** — no Node.js server binary to install separately

### Rules

| Rule | Default | What it checks |
|---|---|---|
| `require-intent-comment/flow` | `warn` | `if`, `for`, `while`, `switch` must be preceded by a comment explaining _why_ |
| `require-intent-comment/iterators` | `warn` | `.map()`, `.filter()`, `.reduce()` etc. must be preceded by a comment |
| `require-intent-comment/break-continue` | `warn` | `break` and `continue` must be preceded by a comment |
| `require-intent-comment/rxjs` | `warn` | RxJS operator chains must be preceded by a comment |
| `require-intent-comment/type-assertion` | `warn` | `as` casts and `!` non-null assertions must be preceded by a comment |
| `require-tsdoc` | `warn` | Exported functions, classes, and interfaces must have TSDoc |
| `require-component-tsdoc` | `warn` | Exported React components must have TSDoc |
| `require-hook-tsdoc` | `warn` | Exported React hooks must have TSDoc |
| `require-node-protocol` | `error` | Node built-in imports must use the `node:` protocol |
| `no-empty-catch` | `warn` | `catch` blocks must not be empty |
| `no-class-components` | `warn` | React class components are not allowed |
| `no-separate-export` | `warn` | Re-exported declarations must be inlined |
| `no-todo-without-issue` | `warn` | `TODO` comments must reference a GitHub issue |
| `single-export-per-file` | `warn` | Files should have a single public export |

---

## Installation

### From the marketplace

Search for **Fusion Lint** in the VS Code Extensions panel, or run:

```sh
code --install-extension equinor.fusion-lint-vscode
```

### From a VSIX file

```sh
code --install-extension fusion-lint-vscode-0.1.0.vsix
```

Or via the VS Code UI: **Extensions → ⋯ → Install from VSIX…**

### Recommend to your team

Add to `.vscode/extensions.json` so contributors are prompted to install:

```json
{
  "recommendations": ["equinor.fusion-lint-vscode"]
}
```

---

## Configuration

All settings are optional. The defaults work without any changes.

| Setting | Default | Description |
|---|---|---|
| `fusion-lint.runOn` | `"change"` | `"change"` — lint as you type. `"save"` — lint only on save. |
| `fusion-lint.serverPath` | _(bundled)_ | Override the bundled server path. Useful when developing the lint engine locally. |
| `fusion-lint.trace.server` | `"off"` | LSP message tracing. Set to `"messages"` or `"verbose"` when debugging. |

To disable a rule or change its severity, add a `fusion-lint.config.js` (or
`.fusion-lintrc.json`) to your project root:

```json
{
  "rules": {
    "require-intent-comment/flow": "error",
    "no-todo-without-issue": "off"
  }
}
```

---

## How it works

On activation the extension spawns the bundled LSP server using VS Code's own
Node.js runtime. The server runs the lint engine on every document open and
change, then pushes diagnostics back via the Language Server Protocol.

WASM-based tree-sitter grammars are used for parsing — the analysis is
TypeScript-version-independent and works on any valid `.ts` or `.tsx` file.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) or open an issue in the
[fusion-framework](https://github.com/equinor/fusion-framework) repository.

---

## License

[MIT](./LICENSE) © Equinor

