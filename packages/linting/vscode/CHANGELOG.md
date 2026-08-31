# fusion-ts-lint-vscode

## 0.2.4

### Patch Changes

- 2899c8a: Internal: rebase `next` onto `main`, syncing in already-published stable releases so they carry a `next` pre-release tag.

## 0.2.4-next.0

### Patch Changes

- c8008e3: Internal: rebase `next` onto `main`, syncing in already-published stable releases so they carry a `next` pre-release tag.

## 0.2.3

### Patch Changes

- c4b42f7: Internal: bump `vscode-languageclient` from `9.0.1` to `10.1.0`. Fixes a type error caused by the new version requiring a `LogOutputChannel` for `traceOutputChannel` — now created via `window.createOutputChannel(name, { log: true })`.

## 0.2.2

### Patch Changes

- 80c3e4a: Internal: minor `README.md` update. No behavior change.

## 0.2.1

### Patch Changes

- ea3e404: Internal: test release to validate Marketplace publishing via Azure OIDC service principal login instead of a personal access token; no functional changes.

## 0.2.0

### Minor Changes

- 903d336: Initial release of `fusion-ts-lint-vscode` VS Code extension.

  Integrates Fusion Framework lint rules into the editor via the LSP server. Squiggles appear inline on `.ts` and `.tsx` files with hover details including the rule ID and severity.
