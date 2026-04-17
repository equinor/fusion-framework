export { fusionAiStrategy } from './create-fusion-strategy.js';
export type { FusionAiStrategyFactory, FusionAiStrategyModules } from './create-fusion-strategy.js';

export { FUSION_EMBED_STRATEGY_NAME, createFusionAiEmbedStrategy } from './fusion-embed.strategy.js';
export { FUSION_INDEX_STRATEGY_NAME, createFusionAiIndexStrategy } from './fusion-index.strategy.js';
export { FUSION_MODEL_STRATEGY_NAME, createFusionAiModelStrategy } from './fusion-model.strategy.js';

// ── Deprecated aliases (old names without "Ai" infix) ──────────────────────
/** @deprecated Use {@link fusionAiStrategy} instead. */
export { fusionAiStrategy as createFusionStrategy } from './create-fusion-strategy.js';
/** @deprecated Use {@link FusionAiStrategyFactory} instead. */
export type { FusionAiStrategyFactory as FusionStrategyFactory } from './create-fusion-strategy.js';
/** @deprecated Use {@link FusionAiStrategyModules} instead. */
export type { FusionAiStrategyModules as FusionStrategyModules } from './create-fusion-strategy.js';
/** @deprecated Use {@link createFusionAiModelStrategy} instead. */
export { createFusionAiModelStrategy as createFusionModelStrategy } from './fusion-model.strategy.js';
/** @deprecated Use {@link createFusionAiEmbedStrategy} instead. */
export { createFusionAiEmbedStrategy as createFusionEmbedStrategy } from './fusion-embed.strategy.js';
/** @deprecated Use {@link createFusionAiIndexStrategy} instead. */
export { createFusionAiIndexStrategy as createFusionIndexStrategy } from './fusion-index.strategy.js';

export * from './types.js';
export * from './static.js';
