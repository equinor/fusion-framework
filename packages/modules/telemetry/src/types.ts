import type z from 'zod';
import type {
  TelemetryItemSchema,
  TelemetryEventSchema,
  TelemetryExceptionSchema,
  TelemetryMetricSchema,
} from './schemas';

export type TelemetryItem = z.infer<typeof TelemetryItemSchema>;
export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;
export type TelemetryException = z.infer<typeof TelemetryExceptionSchema>;
export type TelemetryMetric = z.infer<typeof TelemetryMetricSchema>;

export interface TelemetryAdapter {
  readonly identifier: string;
  processItem(item: TelemetryItem): void;
}
