import { z } from 'zod';
import { operationalIdentifier } from './operational-identifier.js';

/** Allowlisted operational context, captured before enrichment and preserved across relay. */
export const diagnosticContext = z
  .object({
    schemaVersion: z.literal(1),
    source: operationalIdentifier.optional(),
    hostId: z.string(),
    hostName: z.string().optional(),
    hostVersion: z.string().optional(),
    module: operationalIdentifier,
    operation: operationalIdentifier,
    outcome: z.enum(['success', 'failure', 'cancelled']),
    occurredAt: z.number().finite().nonnegative(),
    unit: z.literal('ms'),
    traceId: z.string().optional(),
    spanId: z.string().optional(),
    traceFlags: z.number().int().min(0).max(255).optional(),
  })
  .strict();

/**
 * Host identity supplied by the composition root, never derived from operation payloads.
 * The telemetry module assigns no meaning to any host kind; every descriptive field is optional
 * so any configuration can use built-in diagnostics without pretending to be a known host.
 */
export interface TelemetrySource {
  /**
   * Optional host-defined kind, such as `framework`, `app`, `widget` or `portal`.
   * Any lowercase kebab-case identifier; validated so labels cannot carry dynamic data.
   * Omitted when the host does not classify itself.
   */
  source?: string;
  /** Random, lifecycle-local identity correlating records from one host instance. */
  hostId: string;
  /** Optional static name of the configured unit, such as an application key. */
  hostName?: string;
  /** Optional static version of the configured unit, such as a build version. */
  hostVersion?: string;
}

/** Versioned safe context for built-in operational records. */
export type DiagnosticContext = z.infer<typeof diagnosticContext>;

/**
 * Terminal outcome of one attempted operation. Cancellation is a terminal outcome, not a failure,
 * and skipped work has no outcome at all.
 */
export type OperationalOutcome = DiagnosticContext['outcome'];
