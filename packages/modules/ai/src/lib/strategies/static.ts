/**
 * Discriminator values for each strategy type.
 *
 * Used by {@link Strategy} implementations to declare their capability
 * and by {@link AiProvider} to locate the correct strategy at runtime.
 */
export const STRATEGY_TYPE = {
  INDEX: 'index',
  MODEL: 'model',
  EMBED: 'embed',
} as const;

