import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { makeComponent, ComponentRenderArgs } from '@equinor/fusion-framework-react-app';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

import AppRouter from './Router';

/** Render function */
export default function (el: HTMLElement, args: ComponentRenderArgs) {
    /** create render foor from provided element */
    const root = createRoot(el);

    /** Make app component */
    const AppComponent = makeComponent(
        <StrictMode>
            <h1>🚦 React Router</h1>
            <AppRouter />
        </StrictMode>,
        args,
        (configurator) => {
            enableNavigation(configurator, {
                configure: (config) => {
                    console.log(args);
                    config.basename = args.basename;
                },
            });
        }
    );

    /** render Application */
    root.render(<AppComponent />);

    /** Teardown */
    return () => root.unmount();
}
