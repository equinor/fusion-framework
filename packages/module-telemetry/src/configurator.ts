export interface ITelemetryConfigurator {
    instrumentationKey?: string;
    defaultTags?: Record<string, string>;
}

export class TelemetryConfigurator implements ITelemetryConfigurator {
    instrumentationKey?: string;
    defaultTags?: Record<string, string>;
}
