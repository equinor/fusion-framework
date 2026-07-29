import { z } from 'zod';
import { LogRecordSchema } from './log-record-schema';

const ResourceSchema = z.object({
  attributes: z.array(z.object({ key: z.string(), value: z.any() })),
  droppedAttributesCount: z.number().optional(),
});

const ScopeSchema = z.object({
  name: z.string(),
});

const ScopeLogsSchema = z.object({
  scope: ScopeSchema,
  logRecords: z.array(LogRecordSchema),
});

const ResourceLogsSchema = z.object({
  resource: ResourceSchema,
  scopeLogs: z.array(ScopeLogsSchema),
});

/**
 * Validates a complete OpenTelemetry resource log envelope.
 */
export const LogEntrySchema = z.object({
  resourceLogs: z.array(ResourceLogsSchema),
});
