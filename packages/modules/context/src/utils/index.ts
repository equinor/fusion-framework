/**
 * Utility functions for context module configuration and initialization.
 *
 * - {@link enableContext} — register the context module on a configurator.
 * - {@link resolveInitialContext} — default initial-context resolver (path → parent fallback).
 * - {@link extractContextIdFromPath} — extract a GUID context ID from a URL path.
 * - {@link resolveContextFromPath} — resolve a context item from a URL path.
 *
 * @packageDocumentation
 */
export { enableContext } from './enable-context';
export { resolveInitialContext } from './resolve-initial-context';
export { extractContextIdFromPath, resolveContextFromPath } from './resolve-context-from-path';
