import { ConfigEnvironment } from '@equinor/fusion-framework-module-app';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import {
  type ObservableStateReturnType,
  useObservableSelector,
  useObservableState,
} from '@equinor/fusion-observable/react';

/**
 * A React hook that provides access to the application's environment variables.
 *
 * This hook returns an observable state object that represents the current environment configuration.
 * The environment configuration is retrieved from the app module provided by the framework.
 *
 * @note This hook is only available when the app module is loaded (should be always for applications).
 * This hook in theory should always have a value if config was provided for the application, but is async by nature, hence the `complete` and `error` properties.
 *
 * @example
 * ```typescript
 * const MyComponent = () => {
 *   const env = useAppEnvironmentVariables();
 *   if(!env.complete) {
 *     return <div>Loading environment variables...</div>;
 *   }
 *   if(env.error) {
 *    return <div>Error loading environment variables</div>;
 *   }
 *   return <div>My environment variables: {JSON.stringify(env.value)}</div>;
 * }
 *
 * @template TEnvironmentVariables - The type of the environment variables. Defaults to `unknown`.
 * @returns An observable state object containing the current environment configuration.
 */
export const useAppEnvironmentVariables = <
  TEnvironmentVariables extends ConfigEnvironment = ConfigEnvironment,
>(): ObservableStateReturnType<TEnvironmentVariables> => {
  // Get the current app module instance from the framework
  const app = useCurrentApp<[], TEnvironmentVariables>().currentApp;

  // Ensure the app module is available before proceeding
  if (!app) {
    throw Error('Framework is missing app module');
  }

  // Get the environment configuration observable from the app module
  const env$ = useObservableSelector(
    app.getConfig(),
    (config) => config.environment as TEnvironmentVariables,
  );

  // Return the observable state of the environment configuration
  return useObservableState(env$, {
    initial: app.config?.environment,
  });
};
