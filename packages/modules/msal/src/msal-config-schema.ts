import z from 'zod';
import semver from 'semver';
import { CacheLookupPolicy } from '@azure/msal-browser';

import type { IMsalClient } from './MsalClient.interface';
import type { IMsalProvider } from './MsalProvider.interface';
import { TelemetryConfigSchema } from './telemetry-config-schema';
export type { TelemetryConfig } from './telemetry-config-schema';

/**
 * Zod schema for MSAL module configuration validation.
 *
 * @remarks
 * Kept in its own module so the configuration can be extended at its source.
 * The schema itself describes what reaches `MsalProvider` and strips anything
 * else; keys a variant of this module needs only while the configuration is
 * being built are declared on {@link MsalConfigExtension} instead.
 */
export const MsalConfigSchema = z.object({
  client: z.custom<IMsalClient>().optional(),
  provider: z.custom<IMsalProvider>().optional(),
  requiresAuth: z.boolean().optional(),
  redirectUri: z.string().optional(),
  loginHint: z.string().optional(),
  authCode: z.string().optional(),
  cacheLookupPolicy: z
    .custom<CacheLookupPolicy>(
      (val) =>
        typeof val === 'number' &&
        Object.values(CacheLookupPolicy).includes(val as CacheLookupPolicy),
    )
    .optional(),
  version: z.string().transform((value, ctx) => {
    const coerced = semver.coerce(value);
    // `semver.coerce` returns `null` for an unparseable version; without this guard it
    // would silently become the literal string "null" instead of failing validation.
    if (!coerced) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid MSAL module version' });
      return z.NEVER;
    }
    return coerced.version;
  }),
  telemetry: TelemetryConfigSchema,
});

/**
 * Configuration a variant of this module adds to {@link MsalConfig}.
 *
 * @remarks
 * Empty by design: production MSAL configuration is exactly the schema. This
 * exists so a variant — the test double in `./mock`, for instance — can declare
 * its own branch of the configuration through declaration merging:
 *
 * ```typescript
 * declare module '@equinor/fusion-framework-module-msal' {
 *   interface MsalConfigExtension {
 *     mock?: { account?: MsalMockUser };
 *   }
 * }
 * ```
 *
 * That is what keeps `BaseConfigBuilder._set` honest about the added key. Its
 * target is a dot-path union derived from {@link MsalConfig}, so a key the type
 * does not know about can only be set by casting past the builder — and a
 * generic configurator cannot help, because a dot-path union over an unresolved
 * type parameter defers, taking every existing literal path down with it.
 *
 * The key exists to carry a declaration across the builder, not to reach the
 * provider: the schema strips it during validation, so it is readable from the
 * raw configuration and absent from the validated one.
 */
// biome-ignore lint/suspicious/noEmptyInterface: the extension point is the point
export interface MsalConfigExtension {}

/**
 * Complete configuration object for MSAL authentication module.
 *
 * This type represents the full configuration including client setup, authentication
 * requirements, telemetry, and version information.
 */
export type MsalConfig = z.infer<typeof MsalConfigSchema> & MsalConfigExtension;
