/**
 * Module identifier for the MSAL authentication module.
 *
 * This constant is used to register and identify the MSAL module within the Fusion Framework.
 */
export const ModuleName = 'msal' as const;

/**
 * Enumeration of supported MSAL module versions.
 *
 * This enum defines the available MSAL versions and provides type-safe access to version identifiers.
 * The `Latest` value is automatically set to the current module version at build time.
 *
 * @remarks
 * - `V2`: MSAL v2 compatibility (legacy support)
 * - `V4`: MSAL v4 (current major version)
 * - `Latest`: Always points to the current module version (5.1.0)
 *
 * @example
 * ```typescript
 * import { MsalModuleVersion } from '@equinor/fusion-framework-module-msal';
 *
 * // Check version
 * if (version === MsalModuleVersion.Latest) {
 *   console.log('Using latest MSAL version');
 * }
 *
 * // Create version-specific proxy
 * const proxy = provider.createProxyProvider(MsalModuleVersion.V2);
 * ```
 */
export enum MsalModuleVersion {
  /** MSAL v2 compatibility version */
  V2 = 'v2',
  /** MSAL v4 (current major version) */
  V4 = 'v4',
}
