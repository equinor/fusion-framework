import type { OperationalOutcome } from '@equinor/fusion-framework-module-telemetry/schemas';

/**
 * Static operation labels for AI executions. Model, deployment, index and strategy names are
 * deliberately not labels: they are configuration values, not a fixed allowlist.
 */
export type AiOperation = 'model-invoke' | 'model-stream' | 'embed' | 'search';

/** Reports one terminal outcome of an AI execution. */
export type AiReport = (
  operation: AiOperation,
  outcome: OperationalOutcome,
  duration: number,
) => void;
