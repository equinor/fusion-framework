/** Fusion environments that may be reported; any other `--env` value is never exported. */
const KNOWN_FUSION_ENVIRONMENTS: ReadonlySet<string> = new Set(['ci', 'fqa', 'tr', 'fprd', 'dev']);

/**
 * Returns the target Fusion environment when it is one of the known environments.
 * Custom values may identify private infrastructure, so they are never reported.
 *
 * @param value - Value of the command's `--env` option.
 * @returns The lower-case environment name, or `undefined`.
 */
export const resolveFusionEnvironment = (value: unknown): string | undefined => {
  // Environment names are the only values safe to export.
  if (typeof value !== 'string') return undefined;
  const env = value.trim().toLowerCase();
  return KNOWN_FUSION_ENVIRONMENTS.has(env) ? env : undefined;
};
