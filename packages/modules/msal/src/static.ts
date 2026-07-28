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
 *
 * @remarks
 * - `V2`: MSAL v2 compatibility (legacy support)
 * - `V4`: MSAL v4 compatibility (supports @azure/msal-browser 4.x)
 * - `V5`: MSAL v5 compatibility (supports @azure/msal-browser 5.x)
 *
 * @example
 * ```typescript
 * import { MsalModuleVersion } from '@equinor/fusion-framework-module-msal';
 *
 * // Check version
 * if (version === MsalModuleVersion.V5) {
 *   console.log('Using MSAL v5 compatible version');
 * }
 *
 * // Create version-specific proxy
 * const proxy = provider.createProxyProvider(MsalModuleVersion.V2);
 * ```
 */
export enum MsalModuleVersion {
  /** MSAL v2 compatibility version (legacy support) */
  V2 = 'v2',
  /** MSAL v4 compatibility version (supports @azure/msal-browser 4.x) */
  V4 = 'v4',
  /** MSAL v5 compatibility version (supports @azure/msal-browser 5.x) */
  V5 = 'v5',
}
