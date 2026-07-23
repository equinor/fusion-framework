/**
 * We use tree-sitter-typescript only for its bundled WASM grammar files.
 * The module itself is never imported in TypeScript — we resolve the path via
 * `createRequire(import.meta.url).resolve('tree-sitter-typescript/tree-sitter-typescript.wasm')`.
 *
 * No module declaration needed.
 */
