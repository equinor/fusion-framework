import { lazy } from 'react';

import { FusionContext } from '@equinor/fusion';

import { createFusionContext } from '../create-fusion-context';

import type { PortalFramework } from '../types';

export const createLegacyContextComponent = (props: Parameters<typeof createFusionContext>[0]) =>
    lazy(async () => {
        props.framework ??= window.Fusion as PortalFramework;
        const fusionContext = await createFusionContext(props);
        return {
            default: ({ children }: { children?: JSX.Element }) => (
                <FusionContext.Provider value={fusionContext}>{children}</FusionContext.Provider>
            ),
        };
    });

export default createLegacyContextComponent;
