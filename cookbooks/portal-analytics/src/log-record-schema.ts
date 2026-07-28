import { z } from 'zod';

const AttributeSchema = z.object({
  key: z.string(),
  value: z.any(),
});

/**
 * Validates one OpenTelemetry log record received by the analytics cookbook.
 */
export const LogRecordSchema = z.object({
  timeUnixNano: z.string(),
  observedTimeUnixNano: z.string(),
  severityNumber: z.number(),
  body: z.any(),
  eventName: z.string(),
  attributes: z.array(AttributeSchema).optional(),
  droppedAttributesCount: z.number().optional(),
});
