import { useEffect, useRef, useState } from 'react';

import { Subscription } from 'rxjs';

import { useFramework } from '@equinor/fusion-framework-react';

import { useObservableState } from '@equinor/fusion-observable/react';

import { AppManifestError } from '@equinor/fusion-framework-module-app/errors.js';

import { ErrorViewer } from './ErrorViewer';
import { AppModule } from '@equinor/fusion-framework-module-app';
import EquinorLoader from './EquinorLoader';

/**
 * React Functional Component for handling current application
 *
 * this component will set the current app by provided appKey.
 * when the appKey changes, this component will try to initialize the referred application
 * and render it.
 */
export const AppLoader = (props: { appKey: string }) => {
    const { appKey } = props;
    const fusion = useFramework<[AppModule]>();

    /** reference of application section/container */
    const ref = useRef<HTMLElement>(null);

    /**
     * reference of element which application rendered to
     *
     * the current value will be created when application tries to render.
     * since we cant make sure that application render does ensure teardown,
     * each render instance will have its own element, which then will be added to the application container.
     */
    const appRef = useRef<HTMLDivElement>(document.createElement('div'));

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>();

    /** observe and use the current selected application from framework */
    const currentApp = useObservableState(fusion.modules.app.current$).next;

    useEffect(() => {
        /** when appKey property change, assign it to current */
        fusion.modules.app.setCurrentApp(appKey);
    }, [appKey]);

    useEffect(() => {
        /** flag that application is loading */
        setLoading(true);

        /** clear previous errors */
        setError(undefined);

        /** create a teardown of load */
        const subscription = new Subscription();

        /** make sure that initialize is canceled and disposed if current app changes  */
        subscription.add(
            currentApp?.initialize().subscribe({
                next: ({ manifest, script, config }) => {
                    /** generate basename for application */
                    const [basename] = window.location.pathname.match(
                        /\/?apps\/[a-z|-]+(\/)?/g
                    ) ?? [''];

                    /** create a 'private' element for the application */
                    appRef.current = document.createElement('div');

                    /** extract render callback function from javascript module */
                    const render = script.renderApp ?? script.default;

                    /** add application teardown to current render effect teardown */
                    subscription.add(
                        render(appRef.current, { fusion, env: { basename, config, manifest } })
                    );
                },
                complete: () => {
                    /** flag that application is no longer loading */
                    setLoading(false);
                },
                error: (err) => {
                    /** set error if initialization of application fails */
                    setError(err);
                },
            })
        );

        /** teardown application when hook unmounts */
        return () => subscription.unsubscribe();
    }, [currentApp, appRef]);

    useEffect(() => {
        const refEl = ref.current;
        const appEl = appRef.current;
        if (!(appEl && refEl)) {
            return;
        }
        /** when application has rendered on referenced element, add element to application sections */
        refEl.appendChild(appEl);
        return () => {
            try {
                /** remove application element on unmount */
                refEl.removeChild(appEl);
            } catch (err) {
                console.error(err);
            }
        };
    }, [ref.current, appRef.current]);

    if (error) {
        if (error.cause instanceof AppManifestError) {
            return (
                <div>
                    <h2>🔥 Failed to load application manifest 🤬</h2>
                    <h3>{error.cause.type}</h3>
                    <ErrorViewer error={error} />;
                </div>
            );
        }
        return (
            <div>
                <h2>🔥 Failed to load application 🤬</h2>
                <ErrorViewer error={error} />;
            </div>
        );
    }

    if (loading) {
        return <EquinorLoader text="Loading Application" />;
    }

    return <section ref={ref}></section>;
};

export default AppLoader;
