import { createRoot } from 'react-dom/client';
import { makeComponent, ComponentRenderArgs } from '@equinor/fusion-framework-react-app';

import configure from './config';

import App from './App';

/** render callback function */
export default function (el: HTMLElement, args: ComponentRenderArgs) {
    const root = createRoot(el);

    /** make render component */
    const Component = makeComponent(<App />, args, configure);

    /** render app component */
    root.render(<Component />);

    /** teardown */
    return () => root.unmount();
}
