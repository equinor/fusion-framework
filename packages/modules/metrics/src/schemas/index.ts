import { z } from 'zod';

export const MetricEventSchema = z.object({
  name: z.string(),
  value: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.date().optional(),
});
