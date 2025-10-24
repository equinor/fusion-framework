import type { z } from 'zod';
import type { MetricEventSchema } from './schemas/index.js';

export type MetricEvent = z.infer<typeof MetricEventSchema>;
