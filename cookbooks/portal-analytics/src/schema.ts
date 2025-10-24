import { z } from 'zod';

// Define the schema for attributes
const AttributeSchema = z.object({
  key: z.string(),
  value: z.any(),
});

// Define the schema for the resource
const ResourceSchema = z.object({
  attributes: z.array(AttributeSchema),
  droppedAttributesCount: z.number().optional(),
});

// Define the schema for the log record
const LogRecordSchema = z.object({
  timeUnixNano: z.string(),
  observedTimeUnixNano: z.string(),
  severityNumber: z.number(),
  body: z.any(),
  eventName: z.string(),
  attributes: z.array(AttributeSchema).optional(),
  droppedAttributesCount: z.number().optional(),
});

// Define the schema for the scope
const ScopeSchema = z.object({
  name: z.string(),
});

// Define the schema for scope logs
const ScopeLogsSchema = z.object({
  scope: ScopeSchema,
  logRecords: z.array(LogRecordSchema),
});

// Define the schema for resource logs
const ResourceLogsSchema = z.object({
  resource: ResourceSchema,
  scopeLogs: z.array(ScopeLogsSchema),
});

export const LogEntrySchema = z.object({
  resourceLogs: z.array(ResourceLogsSchema),
});
