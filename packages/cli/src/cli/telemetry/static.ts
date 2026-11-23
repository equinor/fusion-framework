import { TELEMETRY_OPTOUT_ENV } from '@equinor/fusion-framework-cli/bin';

/** Default upper bound for exporting the invocation before the CLI exits. */
export const DEFAULT_TELEMETRY_TIMEOUT_MS = 3000;

/** One-time notice explaining what is collected and how to opt out. */
export const TELEMETRY_NOTICE = [
  '',
  'Fusion Framework CLI collects usage telemetry to improve the tool: the command name, the names',
  'of options used, exit code, duration, error type, OS, architecture, Node.js version, CI',
  'detection, the target Fusion environment and a hashed machine id. Argument and option values,',
  'file paths, user names and tokens are never collected.',
  `Opt out with ${TELEMETRY_OPTOUT_ENV}=1, DO_NOT_TRACK=1 or \`fusion-framework-cli telemetry disable\`.`,
  'Learn more: https://github.com/equinor/fusion-framework/tree/main/packages/cli#telemetry',
  '',
  '',
].join('\n');

/** Tool name reported on every invocation record. */
export const TELEMETRY_TOOL_NAME = 'fusion-framework-cli';
