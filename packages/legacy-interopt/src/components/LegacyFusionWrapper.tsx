import { PropsWithChildren, ReactNode, Suspense, useMemo, useRef } from 'react';

import { FusionRoot } from '@equinor/fusion-components';

import { createLegacyContextComponent } from './create-legacy-context-component';

export type LegacyFusionWrapperProps = {
    loader: NonNullable<ReactNode>;
    context: Parameters<typeof createLegacyContextComponent>;
};

export const LegacyFusionWrapper = (props: PropsWithChildren<LegacyFusionWrapperProps>) => {
    const root = useRef(null);
    const overlay = useRef(null);
    const LegacyContext = useMemo(
        () => createLegacyContextComponent(...props.context),
        [props.context]
    );
    return (
        <Suspense fallback={props.loader}>
            <LegacyContext>
                <FusionRoot rootRef={root} overlayRef={overlay}>
                    {props.children}
                </FusionRoot>
            </LegacyContext>
        </Suspense>
    );
};

export default LegacyFusionWrapper;
