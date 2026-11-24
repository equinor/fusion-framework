import { createCommand } from 'commander';

import {
  DO_NOT_TRACK_ENV,
  TELEMETRY_OPTOUT_ENV,
  resolveTelemetryState,
  writeTelemetrySettings,
} from '@equinor/fusion-framework-cli/bin';

/** Explains why the environment overrides the stored preference, if it does. */
const envOverride = (): string | undefined => {
  const { reason } = resolveTelemetryState();
  // Name the override so users can find the setting that takes precedence.
  if (reason === 'optout-env') return `disabled by ${TELEMETRY_OPTOUT_ENV}`;
  // The standard cross-tool override may be set independently of Fusion.
  if (reason === 'do-not-track') return `disabled by ${DO_NOT_TRACK_ENV}`;
  return undefined;
};

/** Stores the preference and reports the effective state. */
const setEnabled = (enabled: boolean): void => {
  const { configPath } = resolveTelemetryState();
  writeTelemetrySettings(configPath, { enabled });
  console.log(`Telemetry ${enabled ? 'enabled' : 'disabled'}.`);
  const override = envOverride();
  // A successful write does not mean collection is active under an override.
  if (enabled && override) {
    console.log(`Note: telemetry stays ${override}.`);
  }
};

/**
 * `telemetry` command: shows and changes whether the CLI collects usage telemetry.
 *
 * - `telemetry status` prints the effective state and why.
 * - `telemetry enable` / `telemetry disable` persist the preference in the user config.
 *
 * Environment opt-outs (`FUSION_CLI_TELEMETRY_OPTOUT`, `DO_NOT_TRACK`) always win over the
 * stored preference.
 */
const command = createCommand('telemetry').description(
  'Show or change whether the CLI collects usage telemetry',
);

command
  .command('status')
  .description('Show whether usage telemetry is enabled')
  .action(() => {
    const { enabled, reason } = resolveTelemetryState();
    const why = envOverride() ?? (reason === 'config' ? 'by your preference' : 'by default');
    console.log(`Telemetry is ${enabled ? 'enabled' : 'disabled'} (${why}).`);
  });

command
  .command('enable')
  .description('Enable usage telemetry')
  .action(() => setEnabled(true));

command
  .command('disable')
  .description('Disable usage telemetry')
  .action(() => setEnabled(false));

export default command;
