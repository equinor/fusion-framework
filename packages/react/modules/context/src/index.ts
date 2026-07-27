/**
 * React integration for the Fusion context module.
 *
 * Provides hooks for reading the current context ({@link useCurrentContext},
 * {@link useModuleCurrentContext}) and querying available contexts
 * ({@link useQueryContext}, {@link useModuleQueryContext}).
 *
 * @packageDocumentation
 */
export {
  enableContext,
  ContextModule,
  ContextItem,
  ContextItemType,
  IContextProvider,
  IContextModuleConfigurator,
} from '@equinor/fusion-framework-module-context';
export { FusionContextSearchError } from '@equinor/fusion-framework-module-context/errors.js';

export { useCurrentContext } from './useCurrentContext';
export { useModuleCurrentContext } from './useModuleCurrentContext';
export { useQueryContext } from './useQueryContext';
export { useModuleQueryContext } from './useModuleQueryContext';
