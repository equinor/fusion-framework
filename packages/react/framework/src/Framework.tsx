import { FusionConfigurator } from '@equinor/fusion-framework';
import { createFrameworkProvider } from './create-framework-provider';
import { PropsWithChildren, ReactNode, Suspense, useMemo } from 'react';

type ConfigureCallback = (configurator: FusionConfigurator) => void;

export const Framework = (
    props: PropsWithChildren<{
        readonly configure: ConfigureCallback;
        readonly fallback: NonNullable<ReactNode> | null;
    }>,
) => {
    const { configure, fallback, children } = props;
    const Component = useMemo(() => createFrameworkProvider(configure), [configure]);
    return (
        <Suspense fallback={fallback}>
            <Component>{children}</Component>
        </Suspense>
    );
};

export default Framework;
