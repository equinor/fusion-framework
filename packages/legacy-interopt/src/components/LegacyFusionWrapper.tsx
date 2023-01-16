import { PropsWithChildren, ReactNode, Suspense, useMemo, useRef } from 'react';

import { FusionRoot } from '@equinor/fusion-components';

import { createLegacyContextComponent } from './create-legacy-context-component';
import type { PortalFramework } from '../types';
import { FusionContextOptions } from '../create-fusion-context';

export type LegacyFusionWrapperProps = {
    loader: NonNullable<ReactNode>;
    framework: PortalFramework;
    options?: FusionContextOptions;
};

export const LegacyFusionWrapper = (props: PropsWithChildren<LegacyFusionWrapperProps>) => {
    const { framework, options, loader } = props;
    const root = useRef(null);
    const overlay = useRef(null);
    const headerContent = useRef<HTMLElement | null>(null);
    const headerAppAside = useRef<HTMLElement | null>(null);
    const LegacyContext = useMemo(
        () =>
            createLegacyContextComponent({
                framework,
                options,
                refs: { root, overlay, headerContent, headerAppAside },
            }),
        [framework, options]
    );
    return (
        <Suspense fallback={loader}>
            <LegacyContext>
                <FusionRoot rootRef={root} overlayRef={overlay}>
                    {props.children}
                </FusionRoot>
            </LegacyContext>
        </Suspense>
    );
};

export default LegacyFusionWrapper;
