import { Suspense, useMemo, type ElementType } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';

import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppEnv, AppModuleInitiator } from '@equinor/fusion-framework-app';

import { createComponent } from './create-component';
import type { AppModule } from '@equinor/fusion-framework-module-app';

/**
 * Creates a legacy wrapper component that bootstraps a Fusion React app within
 * the older Fusion CLI hosting model.
 *
 * @deprecated Prefer {@link renderApp} for new applications. This helper exists
 * only for backward-compatibility with apps that must run inside the legacy
 * Fusion CLI.
 *
 * @template TModules - Array of additional module types to initialise.
 * @param Component - The root React element to render.
 * @param configure - Optional callback to configure application modules.
 * @returns A React function component that initialises modules and renders the app.
 */
export const createLegacyApp = <TModules extends Array<AnyModule>>(
  Component: ElementType,
  configure?: AppModuleInitiator<TModules>,
) => {
  const LegacyComponent = () => {
    const fusion = useFramework<[AppModule]>();
    // biome-ignore lint/correctness/useExhaustiveDependencies: this will soon be removed
    const RenderComponent = useMemo(() => {
      const creator = createComponent(Component, configure);
      // @eikeland
      // TODO - recheck when legacy fusion-cli is updated!
      const appProvider = fusion.modules.app;
      if (appProvider?.current) {
        const { config, manifest } = appProvider.current;
        return creator(fusion, { config, manifest } as unknown as AppEnv);
      }
      return creator(fusion, {} as unknown as AppEnv);
    }, [fusion]);
    return (
      <Suspense fallback={<p>loading app</p>}>
        <RenderComponent />
      </Suspense>
    );
  };
  return LegacyComponent;
};
