import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import type { OperationalOutcome } from '@equinor/fusion-framework-module-telemetry/schemas';
import { createOperationalRecords } from '@equinor/fusion-framework-module-telemetry/utils';

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

/**
 * Creates an isolated reporter for AI execution outcomes.
 *
 * Each call produces the foundation's `fusion.ai.<operation>.duration` metric and, on failure,
 * one sanitized `.failure` exception. No prompts, completions, embeddings, documents, tool
 * payloads, model names or raw errors are accepted, so none can be exported.
 *
 * @param telemetry - Lazy lookup; `undefined` (absent or disposed telemetry) records nothing.
 * @returns A reporter that never throws into the AI operation.
 * @throws No errors escape; a provider without host identity is reported once as a warning.
 */
export function createAiReporter(telemetry: () => ITelemetryProvider | undefined): AiReport {
  let failureReported = false;
  return (operation, outcome, duration) => {
    try {
      const target = telemetry();
      // Optional telemetry must not impose a dependency on AI execution.
      if (!target) {
        return;
      }
      const source = target.source;
      // Refuse to invent an origin for a provider without host identity.
      if (!source) {
        throw new Error('Operational telemetry requires host source identity');
      }
      // A success or cancellation is one metric; a failure adds one sanitized exception.
      for (const record of createOperationalRecords({
        source,
        module: 'ai',
        operation,
        outcome,
        duration,
      })) {
        target.track(record);
      }
    } catch {
      // Delivery failures are diagnostic health, never AI failures or recursive exports.
      if (!failureReported) {
        failureReported = true;
        console.warn('AI operational telemetry delivery failed');
      }
    }
  };
}
