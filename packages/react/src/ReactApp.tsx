import { JSXElementConstructor } from 'react';
import { render } from 'react-dom';

import { Fusion, ApplicationManifest, ApplicationRenderer } from '@equinor/fusion-framework';
import { ServiceConfig } from '@equinor/fusion-framework/services';

import { FusionServiceProvider } from './services';

type ConfigCallback = (build: ServiceConfig, config: ApplicationManifest) => void;

export type ApplicationRendererss = (
    fusion: Fusion,
    env: ApplicationManifest
) => ((element: HTMLElement) => void) | Promise<(element: HTMLElement) => void>;

export const registerReactApp = (
    Component: JSXElementConstructor<unknown>,
    configure: ConfigCallback
): ApplicationRenderer => {
    return async (fusion, env) => {
        const services = await fusion.createServiceInstance((build) => configure(build, env));
        return (element: HTMLElement) =>
            render(
                <FusionServiceProvider services={services}>
                    <Component />
                </FusionServiceProvider>,
                element
            );
    };
};

export default registerReactApp;
