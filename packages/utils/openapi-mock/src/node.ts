/**
 * Node-only helpers for `@equinor/fusion-openapi-mock`.
 *
 * @remarks
 * Separate from the package's main entry point because {@link loadFakerMap} reads sidecar
 * files from disk (`node:fs`) and, for a `.ts`/`.js` sidecar, resolves it through
 * `@equinor/fusion-imports`' `importConfig` (which shells out to `esbuild`) — neither of which
 * exists in a browser (or browser-mode Vitest) runtime. Import from here only where that's
 * available; a `fields` map built in code, or loaded ahead of time some other way, works with
 * {@link createOpenApiMock} from the main entry point regardless of runtime.
 *
 * @packageDocumentation
 */

export { loadFakerMap, type LoadFakerMapOptions } from './lib/load-faker-map.js';
