/**
 * Response selectors that parse raw context API responses into {@link ContextItem}s.
 *
 * - {@link getContextSelector} — parses a single-item GetContext response.
 * - {@link queryContextSelector} — parses a multi-item QueryContext response.
 * - {@link relatedContextSelector} — parses a multi-item RelatedContext response.
 *
 * @packageDocumentation
 */
export { getContextSelector } from './get-context-selector.js';
export { queryContextSelector } from './query-context-selector.js';
export { relatedContextSelector } from './related-context-selector.js';
