import { useMemo } from 'react';

import { useObservableState } from '@equinor/fusion-observable/react';

import type { AnyModule } from '@equinor/fusion-framework-module';
import type {
  ConfigEnvironment,
  AppModule,
  CurrentApp,
} from '@equinor/fusion-framework-module-app';

import { useFramework } from '../useFramework';

/**
 * React hook that observes and returns the currently active application.
 *
 * @remarks
 * Subscribes to the `current$` stream on the App module and returns the
 * latest value together with helpers to change or clear the active app.
 *
 * **Warning:** The template parameters are compile-time hints only — the
 * hook does not validate that the specified modules are actually enabled.
 *
 * @template TModules - Tuple of module types the current app is expected to
 *   have configured (type-hint only).
 * @template TEnv - Expected environment configuration shape (type-hint only).
 *
 * @returns An object containing:
 *   - `currentApp` — The current {@link CurrentApp} instance, `null` when
 *     explicitly cleared, or `undefined` while loading.
 *   - `setCurrentApp(appKey)` — Sets the active app by its key.
 *   - `clearCurrentApp()` — Clears the currently active app.
 *   - `error` — Any error emitted by the observable.
 *
 * @throws {Error} If the `AppModule` is not configured in the framework.
 *
 * @example
 * ```tsx
 * const { currentApp, setCurrentApp } = useCurrentApp();
 * return <button onClick={() => setCurrentApp('my-app')}>{currentApp?.manifest?.name}</button>;
 * ```
 */
export const useCurrentApp = <
  TModules extends Array<AnyModule> = [],
  TEnv extends ConfigEnvironment = ConfigEnvironment,
>(): {
  currentApp?: CurrentApp<TModules, TEnv> | null;
  setCurrentApp: (appKey: string) => void;
  clearCurrentApp: () => void;
  error?: unknown;
} => {
  const provider = useFramework<[AppModule]>().modules.app;
  if (!provider) {
    throw Error('Current framework does not have AppModule configured');
  }
  const currentApp$ = useMemo(() => provider.current$, [provider]);
  const { value, error } = useObservableState(currentApp$, { initial: provider.current });
  return {
    currentApp: value as CurrentApp<TModules, TEnv>,
    setCurrentApp: useMemo(() => provider.setCurrentApp.bind(provider), [provider]),
    clearCurrentApp: useMemo(() => provider.clearCurrentApp.bind(provider), [provider]),
    error,
  };
};

export default useCurrentApp;
