/**
 * Settings sub-path entry-point.
 *
 * Provides hooks for reading and updating per-application user settings
 * that are persisted by the Fusion platform.
 *
 * @packageDocumentation
 */
export { useAppSetting } from './useAppSetting.js';
export { useAppSettings } from './useAppSettings.js';

export type { AppSettings } from '@equinor/fusion-framework-module-app';
