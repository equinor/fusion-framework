import type { Module } from 'ag-grid-enterprise';

/**
 * Default AG Grid modules registered for every consumer of the Fusion AG Grid module.
 *
 * @remarks
 * This array is intentionally empty. Adding modules here increases the bundle size
 * for **all** consumers. Prefer registering modules per-application via
 * {@link IAgGridConfigurator.addModule | builder.addModule()} or
 * {@link IAgGridConfigurator.setModules | builder.setModules()}.
 */
export const defaultModules = [] as Module[];
