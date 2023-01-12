import { lazy } from 'react';
import type { ReactNode } from 'react';

import { FusionContext } from '@equinor/fusion';

import { createFusionContext } from '../create-fusion-context';

import type { PortalFramework } from '../types';

export const createLegacyContextComponent = (props: Parameters<typeof createFusionContext>) =>
    lazy(async () => {
        props[0].framework ??= window.Fusion as PortalFramework;
        const fusionContext = await createFusionContext(...props);
        return {
            default: ({ children }: { children?: ReactNode }) => (
                <FusionContext.Provider value={fusionContext}>{children}</FusionContext.Provider>
            ),
        };
    });

export default createLegacyContextComponent;
