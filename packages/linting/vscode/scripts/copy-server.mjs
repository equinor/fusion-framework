/**
 * Copies the pre-built LSP server and its WASM grammar files into the
 * extension's dist/ directory so the VSIX is fully self-contained.
 *
 * Outputs:
 *   dist/server.js                              — bundled LSP server
 *   dist/wasm/web-tree-sitter.wasm              — web-tree-sitter runtime
 *   dist/wasm/tree-sitter-typescript.wasm       — TypeScript grammar
 *   dist/wasm/tree-sitter-tsx.wasm              — TSX grammar
 */

import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(__dirname, '..');
const distDir = join(extensionRoot, 'dist');
const wasmDir = join(distDir, 'wasm');

mkdirSync(wasmDir, { recursive: true });

// Resolve packages from the rules package — that is where tree-sitter packages
// are installed in the pnpm virtual store.
const rulesRoot = resolve(extensionRoot, '..', 'rules');
const r = createRequire(join(rulesRoot, 'src', 'index.ts'));

// --- server bundle ---
const lspRoot = resolve(extensionRoot, '..', 'lsp');
const serverSrc = join(lspRoot, 'dist', 'esm', 'server.mjs');
copyFileSync(serverSrc, join(distDir, 'server.mjs'));
console.log('  copied server.mjs');

// --- web-tree-sitter WASM (runtime) ---
const wtsDir = dirname(r.resolve('web-tree-sitter'));
copyFileSync(join(wtsDir, 'web-tree-sitter.wasm'), join(wasmDir, 'web-tree-sitter.wasm'));
console.log('  copied web-tree-sitter.wasm');

// --- TypeScript + TSX grammar WASMs ---
const tsGrammarDir = dirname(r.resolve('tree-sitter-typescript/package.json'));
copyFileSync(
  join(tsGrammarDir, 'tree-sitter-typescript.wasm'),
  join(wasmDir, 'tree-sitter-typescript.wasm'),
);
copyFileSync(join(tsGrammarDir, 'tree-sitter-tsx.wasm'), join(wasmDir, 'tree-sitter-tsx.wasm'));
console.log('  copied tree-sitter-typescript.wasm + tree-sitter-tsx.wasm');
