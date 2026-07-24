import { readFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser, Language } from 'web-tree-sitter';

const _require = createRequire(import.meta.url);

/**
 * Returns the directory where all WASM files are colocated, or `null` when
 * they must be resolved individually from their own packages.
 *
 * Resolution order:
 * 1. `FUSION_LINT_WASM_DIR` env var — set by the VS Code extension on spawn.
 * 2. A `wasm/` directory next to this file's bundle — works when the server is
 *    packaged inside the extension VSIX without any env var.
 * 3. `null` — fall back to per-package `require.resolve()` for each WASM file.
 */
async function wasmDir(): Promise<string | null> {
  if (process.env.FUSION_LINT_WASM_DIR) return process.env.FUSION_LINT_WASM_DIR;
  // Check for a wasm/ sibling of the running bundle file (bundled extension context)
  const sibling = join(dirname(fileURLToPath(import.meta.url)), 'wasm');
  try {
    await access(sibling);
    return sibling;
  } catch {
    // sibling wasm/ does not exist — fall through to per-package resolution
  }
  return null;
}

const _wasmDir = await wasmDir();

await Parser.init({
  /**
   * Resolves the WASM bundle path for web-tree-sitter.
   *
   * Uses the colocated `wasm/` dir when available, otherwise resolves from
   * the installed `web-tree-sitter` package directory.
   *
   * @param name - The filename requested by the WASM loader (e.g. `web-tree-sitter.wasm`).
   * @returns Absolute path to the resolved WASM file.
   */
  locateFile(name: string): string {
    return _wasmDir
      ? join(_wasmDir, name)
      : join(dirname(_require.resolve('web-tree-sitter')), name);
  },
});

// Grammar WASMs live in tree-sitter-typescript — use sibling dir if available
const tsxWasmPath = _wasmDir
  ? join(_wasmDir, 'tree-sitter-tsx.wasm')
  : _require.resolve('tree-sitter-typescript/tree-sitter-tsx.wasm');
const tsxLanguage = await Language.load(await readFile(tsxWasmPath));

/**
 * Shared tree-sitter parser pre-loaded with the TSX grammar.
 * Use for `.tsx` files — handles JSX syntax that the TypeScript grammar rejects.
 *
 * JavaScript is single-threaded — one shared instance is safe as long as
 * callers do not call `setLanguage` on it.
 */
export const tsxParser = new Parser();
tsxParser.setLanguage(tsxLanguage);
