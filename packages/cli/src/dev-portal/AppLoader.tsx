import { useEffect, useMemo, useRef, useState } from 'react';

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

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>();

    // TODO change to `useCurrentApp`
    /** observe and use the current selected application from framework */
    const { value: currentApp } = useObservableState(
        useMemo(() => fusion.modules.app.current$, [fusion.modules.app])
    );

    useEffect(() => {
        /** when appKey property change, assign it to current */
        fusion.modules.app.setCurrentApp(appKey);
    }, [appKey, fusion]);

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
                    const el = document.createElement('div');
                    el.style.height = '100%'
                    if (!ref.current) {
                        throw Error('Missing application mounting point');
                    }

                    ref.current.appendChild(el);
                    ref.current.style.height = '100%'

                    /** extract render callback function from javascript module */
                    const render = script.renderApp ?? script.default;

                    /** add application teardown to current render effect teardown */
                    subscription.add(render(el, { fusion, env: { basename, config, manifest } }));

                    /** remove app element when application unmounts */
                    subscription.add(() => el.remove());
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
    }, [fusion, currentApp, ref]);

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

    return <section ref={ref}>{loading && <EquinorLoader text="Loading Application" />}</section>;
};

export default AppLoader;
