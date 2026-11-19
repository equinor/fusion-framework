/** Persisted, user-level telemetry preferences of the Fusion Framework CLI. */
export interface TelemetrySettings {
  /** Explicit user choice from `fusion-framework-cli telemetry enable|disable`. */
  enabled?: boolean;
  /**
   * Whether the one-time collection notice has been shown. Kept in its own marker file (see
   * {@link markTelemetryNoticeShown}) so recording the notice never rewrites the user's choice.
   */
  noticeShown?: boolean;
}

/** Why telemetry is enabled or disabled for the current run. */
export type TelemetryStateReason = 'default' | 'config' | 'optout-env' | 'do-not-track';

/** Effective telemetry state for the current run. */
export interface TelemetryState {
  enabled: boolean;
  reason: TelemetryStateReason;
  /** Location of the persisted settings file. */
  configPath: string;
  settings: TelemetrySettings;
}
