import { configureModules, type AppRenderFn } from '@equinor/fusion-framework-app';

/**
 * This callback is executed during the configuration phase of the application.
 * It allows for custom configuration logic to be applied based on the environment.
 *
 * @param configurator - The configurator instance that provides methods to configure the application.
 * @param env - The environment object that contains details about the render environment.
 */
const init = configureModules((configurator, env) => {
    console.log('configuring application', env);

    /**
     * Registers a callback to be called once the application configuration has been created.
     * This allows for inspection or modification of the configuration before the application is initialized.
     *
     * @param config - The created application configuration object.
     */
    configurator.onConfigured((config) => {
        console.log('application config created', config);
    });

    /**
     * Registers a callback to be called once the application modules have been initialized.
     * This is useful for running any post-initialization logic or to access the initialized modules.
     *
     * @param instance - The instance object containing all initialized modules.
     */
    configurator.onInitialized((instance) => {
        console.log('application config initialized', instance);
    });
});

/**
 * Initializes and renders the application within a given HTML element.
 *
 * @param el - The HTML element where the application will be rendered.
 * @param args - Initialization arguments for the application modules.
 */
export const renderApp: AppRenderFn = (el, args) => {
    const myApp = document.createElement('pre');
    init(args)
        .then((modules) => {
            // Display the default account information from the auth module
            myApp.innerText = JSON.stringify(modules.auth.defaultAccount, null, 2);
        })
        .catch((error) => {
            // Display any errors that occurred during initialization
            myApp.innerText = JSON.stringify(error, null, 2);
        });
    // Indicate that the application is loading until the modules are initialized
    myApp.innerText = 'loading...';
    el.appendChild(myApp);
};
