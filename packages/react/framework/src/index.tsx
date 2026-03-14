/**
 * React bindings for the Fusion Framework.
 *
 * @remarks
 * This package provides React components, context providers, and hooks for
 * initialising and consuming a Fusion Framework instance inside a React
 * application tree. It is the main entry-point for portals and host
 * applications that need to bootstrap the framework with React.
 *
 * [[include:framework-react/README.MD]]
 * @module
 */

export type { Fusion } from '@equinor/fusion-framework';
export { FusionConfigurator } from '@equinor/fusion-framework';

export { createFrameworkProvider } from './create-framework-provider';
export { FrameworkProvider } from './context';

export { useFramework } from './useFramework';
export { useFrameworkModule } from './useFrameworkModule';

export { default, Framework } from './Framework';
