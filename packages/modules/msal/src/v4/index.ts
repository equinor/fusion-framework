/**
 * MSAL v4 compatibility layer for v5 implementation.
 *
 * @remarks
 * This module provides v4-compatible proxies when running on v5.
 * Since v4 and v5 are API compatible, this is primarily a passthrough
 * with version metadata adjustments.
 *
 * @module v4
 */

export { createProxyProvider } from './create-proxy-provider';
export type * from './types';
