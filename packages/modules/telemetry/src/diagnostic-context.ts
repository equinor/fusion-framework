import { z } from 'zod';

/** Allowlisted operational context, captured before enrichment and preserved across relay. */
export const diagnosticContext = z
  .object({
    schemaVersion: z.literal(1),
    source: z.enum(['framework', 'app', 'widget']),
    hostId: z.string(),
    appKey: z.string().optional(),
    appVersion: z.string().optional(),
    widgetKey: z.string().optional(),
    widgetVersion: z.string().optional(),
    module: z.string(),
    operation: z.string(),
    outcome: z.enum(['success', 'failure', 'cancelled']),
    occurredAt: z.number().finite().nonnegative(),
    unit: z.literal('ms'),
    traceId: z.string().optional(),
    spanId: z.string().optional(),
    traceFlags: z.number().int().min(0).max(255).optional(),
  })
  .strict();

/** Host identity supplied by the composition root, never derived from operation payloads. */
export interface TelemetrySource {
  source: 'framework' | 'app' | 'widget';
  hostId: string;
  appKey?: string;
  appVersion?: string;
  widgetKey?: string;
  widgetVersion?: string;
}

/** Versioned safe context for built-in operational records. */
export type DiagnosticContext = z.infer<typeof diagnosticContext>;
