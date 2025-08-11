export {
  TelemetryModule,
  module as telemetryModule,
} from './module.js';

export type {
  ITelemetryConfigurator,
  TelemetryConfig,
} from './TelemetryConfigurator.interface.js';

export type { ITelemetryProvider } from './TelemetryProvider.interface.js';

export { BaseTelemetryAdapter, type TelemetryAdapter } from './TelemetryAdapter.js';

export { TelemetryLevel, TelemetryType } from './static.js';

export type {
  MetadataExtractor,
  MetadataExtractorArgs,
  TelemetryItem,
  TelemetryEvent,
  TelemetryException,
  TelemetryMetric,
  TelemetryCustomEvent,
} from './types.js';

export { enableTelemetry } from './enable-telemetry.js';

export { default } from './module.js';
