// import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { type AppRenderFn, makeComponent } from '@equinor/fusion-framework-react-app';

import configure from './config';
import App from './App';

/**
 * Render function that mounts the React application to a provided DOM element.
 *
 * @param el - The DOM element to mount the React application on.
 * @param args - Arguments to be passed to the application configuration.
 * @returns A teardown function that can be used to unmount the application.
 */
export const renderApp: AppRenderFn = (el, args) => {
    // Create the application component with configuration and arguments.
    const AppComponent = makeComponent(<App />, args, configure);

    // Create a root for the application using the provided DOM element.
    const root = createRoot(el);

    // Render the application component to the root.
    root.render(<AppComponent />);

    // Return a teardown function to unmount the application from the root.
    return () => root.unmount();
};

export default renderApp;
