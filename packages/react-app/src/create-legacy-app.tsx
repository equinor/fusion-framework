import { Suspense, useMemo } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';

import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppModuleInitiator } from '@equinor/fusion-framework-app';

import { createComponent } from './create-component';

export const createLegacyApp = <TModules extends Array<AnyModule>>(
    Component: React.ComponentType,
    configure?: AppModuleInitiator<TModules>
) => {
    return (): JSX.Element => {
        const fusion = useFramework();
        const RenderComponent = useMemo(() => {
            const creator = createComponent(Component, configure);
            return creator(fusion, {});
        }, []);
        return (
            <Suspense fallback={<p>loading app</p>}>
                <RenderComponent />
            </Suspense>
        );
    };
};
