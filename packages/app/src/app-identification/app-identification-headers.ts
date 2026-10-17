/**
 * Request header names used to identify the Fusion app behind an outgoing HTTP request.
 *
 * The names match the known headers read by `RequestHeaderActivityProcessor` in
 * `Fusion.Infrastructure.Diagnostics`, which tags backend request telemetry with them
 * (`x-fusion-app` becomes the `fusion.app` tag).
 */
export const appIdentificationHeaders = {
  app: 'x-fusion-app',
  appVersion: 'x-fusion-app-version',
  frameworkVersion: 'x-fusion-framework-version',
} as const;
