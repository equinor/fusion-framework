import z from 'zod';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import { version } from './version';

/**
 * Zod schema for telemetry configuration validation.
 *
 * @internal
 */
export const TelemetryConfigSchema = z.object({
  provider: z.custom<ITelemetryProvider>().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({
    module: 'msal',
    version,
  }),
  scope: z.array(z.string()).optional().default(['framework', 'authentication']),
});

/**
 * Telemetry configuration for MSAL module.
 *
 * This configuration controls how authentication events are tracked and logged
 * through the framework's telemetry system.
 */
export type TelemetryConfig = z.infer<typeof TelemetryConfigSchema>;
