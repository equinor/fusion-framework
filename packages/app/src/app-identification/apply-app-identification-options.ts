import { AppConfiguratorError } from '../AppConfiguratorError.js';
import { toOrigin } from './to-origin.js';
import type { AppIdentificationOptions, AppIdentificationSettings } from './types.js';

/**
 * Applies identification options on top of the current settings.
 *
 * Origins accumulate across calls so separate setup helpers can each opt in their own API;
 * `enabled` only changes when set explicitly.
 *
 * @param settings - The current settings.
 * @param options - The options to apply.
 * @returns The new settings.
 * @throws {AppConfiguratorError} When an allowed origin is not an absolute URL or origin.
 */
export const applyAppIdentificationOptions = (
  settings: AppIdentificationSettings,
  options: AppIdentificationOptions,
): AppIdentificationSettings => {
  const allowedOrigins = new Set(settings.allowedOrigins);
  // Normalize up front so request matching is a plain set lookup
  for (const value of options.allowedOrigins ?? []) {
    const origin = toOrigin(value);
    // A relative or malformed value cannot be matched against request origins, so fail loudly at setup
    if (!origin) {
      throw new AppConfiguratorError(
        `Invalid app identification origin [${value}]. Use an absolute URL or origin.`,
        'configuration',
      );
    }
    allowedOrigins.add(origin);
  }
  return { enabled: options.enabled ?? settings.enabled, allowedOrigins };
};
