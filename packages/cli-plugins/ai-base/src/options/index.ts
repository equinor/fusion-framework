/**
 * AI command-option utilities for Fusion Framework CLI plugins.
 *
 * @remarks
 * This entry point provides Commander option definitions, a Zod validation schema,
 * and the {@link withOptions} helper that wires options and pre-action validation
 * into any Commander command. Import from
 * `@equinor/fusion-framework-cli-plugin-ai-base/command-options`.
 *
 * @packageDocumentation
 */

export { default as options } from './options.js';
export { withOptions } from './with-options.js';
export { AiOptionsSchema, type AiOptionsType } from './schema.js';
export type { AiOptions } from './types.js';
