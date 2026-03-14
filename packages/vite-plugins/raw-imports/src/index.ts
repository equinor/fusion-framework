/**
 * Vite plugin for embedding file content as raw strings in the JavaScript bundle.
 *
 * @remarks
 * Re-exports the {@link rawImportsPlugin} factory, its {@link RawImportsPluginOptions}
 * configuration interface, and a default export for convenient Vite config usage.
 *
 * @packageDocumentation
 */
export { default, rawImportsPlugin, type RawImportsPluginOptions } from './plugin.js';
