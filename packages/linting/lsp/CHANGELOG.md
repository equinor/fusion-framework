# @equinor/fusion-framework-lint-lsp

## 0.2.3

### Patch Changes

- 19e0636: Internal: add missing TypeScript project `references` between the linting packages (`lint-core`, `lint-rules`, `lint-config`, `fusion-lint`, `lint-lsp`).

  Without these references, `tsc -b` couldn't resolve `@equinor/fusion-framework-lint-core`/`lint-config` types when a package was built in isolation (as happens during `npm publish`'s `prepack` step), causing the previous release's publish to fail partway through.

## 0.2.2

### Patch Changes

- 3ef8739: Internal: bump `esbuild` from `0.25.12` to `0.28.1`.
- 3590018: Internal: bump `vscode-languageserver` from `9.0.1` to `10.1.0`. Fixes a broken import caused by the package dropping the `/node.js` export subpath in favor of `/node` (no extension) — updated `src/server.ts` accordingly.

## 0.2.1

### Patch Changes

- 80c3e4a: Internal: add clarifying intent comments to satisfy fusion-lint's own `require-intent-comment/flow` rule; no behavior changes.
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
  - @equinor/fusion-framework-lint-config@1.0.0
  - @equinor/fusion-framework-lint-core@1.0.0

## 0.2.0

### Minor Changes

- b68e731: Initial release of `@equinor/fusion-framework-lint-lsp`.

  An LSP language server that exposes Fusion Framework lint diagnostics over the Language Server Protocol. Powers the VS Code extension and any LSP-compatible editor.

### Patch Changes

- Updated dependencies [b68e731]
- Updated dependencies [b68e731]
  - @equinor/fusion-framework-lint-config@0.2.0
  - @equinor/fusion-framework-lint-core@0.2.0
