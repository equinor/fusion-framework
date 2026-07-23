import * as path from 'node:path';
import { ExtensionContext, workspace, window } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

/** Active LSP client — kept at module scope so `deactivate` can stop it. */
let client: LanguageClient | undefined;

/**
 * Resolves the path to the `fusion-lint-server` entry point.
 *
 * Priority:
 * 1. `fusion-lint.serverPath` setting — explicit override for local builds or
 *    alternative installations.
 * 2. The server bundled inside this extension's own `node_modules` — the
 *    default, requires no manual installation by the user.
 *
 * @param extensionPath - Absolute path to the extension install directory.
 * @returns Absolute path to the server module file.
 */
function resolveServerPath(extensionPath: string): string {
  const config = workspace.getConfiguration('fusion-lint');
  const override: string = config.get('serverPath') ?? '';
  // Use the explicit override when the user has configured one
  if (override.trim().length > 0) return override.trim();
  // Fall back to the server bundled with this extension — no global install needed
  return path.join(extensionPath, 'dist', 'server.mjs');
}

/**
 * Called by VS Code when the extension activates (first `.ts` / `.tsx` file is opened).
 *
 * Resolves the bundled `fusion-lint-server` path, starts the language server
 * process, and connects the LSP client. No manual server install is required.
 *
 * @param context - Extension context provided by VS Code.
 */
export function activate(context: ExtensionContext): void {
  const serverModule = resolveServerPath(context.extensionPath);

  const serverOptions: ServerOptions = {
    // Spawn the server as a Node.js script so it works on any platform without
    // a separate binary install — Node.js is always available inside VS Code.
    command: process.execPath,
    args: [serverModule, '--stdio'],
    transport: TransportKind.stdio,
    options: {
      // Run the server in the workspace root so it finds fusion-lint.config.*
      cwd: getWorkspaceRoot(),
      env: {
        ...process.env,
        // Tell the bundled server where to find its WASM grammar files — they
        // are pre-copied to dist/wasm/ by the copy-server build step.
        FUSION_LINT_WASM_DIR: path.join(context.extensionPath, 'dist', 'wasm'),
      },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'typescriptreact' },
    ],
    synchronize: {
      // Re-lint when a config file is saved, and forward setting changes to the server
      fileEvents: workspace.createFileSystemWatcher('**/fusion-lint.config.*'),
      configurationSection: 'fusion-lint',
    },
    initializationOptions: () => ({
      runOn: workspace.getConfiguration('fusion-lint').get<string>('runOn') ?? 'change',
    }),
    traceOutputChannel: window.createOutputChannel('Fusion Lint (LSP trace)'),
  };

  client = new LanguageClient(
    'fusion-lint',
    'Fusion Lint',
    serverOptions,
    clientOptions,
  );

  // Register the client so VS Code disposes it on deactivation
  context.subscriptions.push(client);
  client.start();
}

/**
 * Called by VS Code when the extension deactivates (window close, disable, etc.).
 *
 * @returns A promise that resolves once the client has shut down cleanly.
 */
export function deactivate(): Thenable<void> | undefined {
  // Guard: nothing to stop if the client was never started
  if (!client) return undefined;
  return client.stop();
}

/**
 * Returns the first workspace folder path, falling back to `process.cwd()`.
 *
 * @returns Absolute path to the workspace root.
 */
function getWorkspaceRoot(): string {
  const folders = workspace.workspaceFolders;
  // Use the first workspace folder when available; fall back to process cwd
  if (folders && folders.length > 0) return folders[0].uri.fsPath;
  return process.cwd();
}
