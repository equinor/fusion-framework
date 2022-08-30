import { Suspense, useMemo } from 'react';

import { useFramework } from '@equinor/fusion-framework-react/hooks';

import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppConfigurator } from '@equinor/fusion-framework-app';

import { createApp } from './create-app';

export const createLegacyApp = <TModules extends Array<AnyModule>>(
    Component: React.ComponentType,
    configure?: AppConfigurator<TModules>,
    modules?: TModules
) => {
    return (): JSX.Element => {
        const fusion = useFramework();
        const RenderComponent = useMemo(() => {
            const creator = createApp(Component, configure, modules);
            return creator(fusion, { name: '' });
        }, []);
        return (
            <Suspense fallback={<p>loading app</p>}>
                <RenderComponent />
            </Suspense>
        );
    };
};
