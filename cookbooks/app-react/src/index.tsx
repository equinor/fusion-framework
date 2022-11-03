import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { makeComponent, ComponentRenderArgs } from '@equinor/fusion-framework-react-app';

export default function (el: HTMLElement, args: ComponentRenderArgs) {
    const root = createRoot(el);
    const AppComponent = makeComponent(
        <StrictMode>
            <h1>🚀 Hello Fusion 😎</h1>
        </StrictMode>,
        args
    );
    root.render(<AppComponent />);
    return () => root.unmount();
}
