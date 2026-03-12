/**
 * Available AI agents for live-ai server.
 */
export const AVAILABLE_AGENTS = ['default', 'dependabot'] as const;

/**
 * Available AI models for live-ai server.
 */
export const AVAILABLE_MODELS = ['gpt-5.3-codex', 'gpt-5.3', 'gpt-4.1'] as const;

/**
 * Runtime selection: union of available agents and models.
 */
export type AvailableAgent = (typeof AVAILABLE_AGENTS)[number];
export type AvailableModel = (typeof AVAILABLE_MODELS)[number];
