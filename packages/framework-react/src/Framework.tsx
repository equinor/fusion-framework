import { FusionConfigurator } from '@equinor/fusion-framework';
import { createFrameworkProvider } from './create-framework-provider';
import { PropsWithChildren, ReactNode, Suspense, useMemo } from 'react';

export const Framework = (
    props: PropsWithChildren<{
        configure: (configurator: FusionConfigurator) => void;
        fallback: NonNullable<ReactNode> | null;
    }>
) => {
    const Component = useMemo(() => createFrameworkProvider(props.configure), [props.configure]);
    return (
        <Suspense fallback={props.fallback}>
            <Component>{props.children}</Component>
        </Suspense>
    );
};

export default Framework;
