import { Suspense, useMemo } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';

import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppEnv, AppModuleInitiator } from '@equinor/fusion-framework-app';

import { createComponent } from './create-component';
import { AppModule } from '@equinor/fusion-framework-module-app';

export const createLegacyApp = <TModules extends Array<AnyModule>>(
    Component: React.ComponentType,
    configure?: AppModuleInitiator<TModules>
) => {
    return (): JSX.Element => {
        const fusion = useFramework<[AppModule]>();
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
};
