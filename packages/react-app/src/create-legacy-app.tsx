import { Suspense, useMemo } from 'react';

import { useFramework } from '@equinor/fusion-framework-react/hooks';

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
            return creator({ fusion, env: { name: 'legacy' } });
        }, []);
        return (
            <Suspense fallback={<p>loading app</p>}>
                <RenderComponent />
            </Suspense>
        );
    };
};
