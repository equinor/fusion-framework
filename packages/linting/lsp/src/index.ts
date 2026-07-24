/**
 * @packageDocumentation
 *
 * LSP language server entry point for the Fusion Framework linter.
 *
 * Start this server with `--stdio` (default) to communicate over stdin/stdout.
 * Any LSP-compatible client — VS Code, Neovim, Zed, OpenCode, Cursor — can
 * connect to it by pointing at the `fusion-lint-server` binary.
 *
 * @example
 * ```sh
 * fusion-lint-server --stdio
 * ```
 *
 * See the editor-specific extension README (e.g. `packages/linting/vscode/README.md`)
 * for settings like the VS Code `fusion-ts-lint.serverPath` override.
 */
