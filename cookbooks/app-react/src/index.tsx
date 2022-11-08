import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { makeComponent, ComponentRenderArgs } from '@equinor/fusion-framework-react-app';

/** Render function */
export default function (el: HTMLElement, args: ComponentRenderArgs) {
    /** create render foor from provided element */
    const root = createRoot(el);

    /** Make app component */
    const AppComponent = makeComponent(
        <StrictMode>
            <h1>🚀 Hello Fusion😎</h1>
        </StrictMode>,

        /** render args (framework and environment variables) */
        args,

        /** Configuration callback */
        (_fusion, env) => {
            console.log(env);
        }
    );

    /** render Application */
    root.render(<AppComponent />);

    /** Teardown */
    return () => root.unmount();
}
