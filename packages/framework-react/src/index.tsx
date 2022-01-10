import { createContext, lazy, useContext } from 'react';
import initFusion from '@equinor/fusion-framework';
import type { Fusion, FusionConfigurator } from '@equinor/fusion-framework';

const frameworkContext = createContext<Fusion | null>(null);

export const FrameworkProvider = frameworkContext.Provider;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createFrameworkProvider = (configurator: FusionConfigurator) =>
    lazy(async () => {
        const framework = await initFusion(configurator);
        return {
            default: ({ children }: { children?: React.ReactNode }) => (
                <frameworkContext.Provider value={framework}>{children}</frameworkContext.Provider>
            ),
        };
    });

export const useFramework = (): Fusion => {
    let context = useContext(frameworkContext);
    if (!context) {
        console.warn('could not locate fusion in context!');
    }
    context ??= window.Fusion;
    if (!context) {
        console.error('Could not load framework, might not be initiated?');
    }
    return context;
};

export default FrameworkProvider;
