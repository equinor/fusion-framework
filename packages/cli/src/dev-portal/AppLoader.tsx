import { useEffect, useRef, useState } from 'react';

import { Subscription } from 'rxjs';

import { useFramework } from '@equinor/fusion-framework-react';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import { useObservableState } from '@equinor/fusion-observable/react';

import { AppManifestError } from '@equinor/fusion-framework-module-app/errors.js';

import { ErrorViewer } from './ErrorViewer';
import { AppModule } from '@equinor/fusion-framework-module-app';

export const AppLoader = (props: { appKey: string }) => {
    const { appKey } = props;
    const fusion = useFramework<[AppModule]>();
    const ref = useRef<HTMLElement>(null);
    const appRef = useRef<HTMLDivElement>(document.createElement('div'));

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>();

    const currentApp = useObservableState(fusion.modules.app.current$);

    useEffect(() => {
        fusion.modules.app.setCurrentApp(appKey);
    }, [appKey]);

    useEffect(() => {
        setLoading(true);
        setError(undefined);
        const subscription = new Subscription();
        subscription.add(
            currentApp?.initialize().subscribe({
                next: ([manifest, module, config]) => {
                    const [basename] = window.location.pathname.match(
                        /\/?apps\/[a-z|-]+(\/)?/g
                    ) ?? [''];
                    appRef.current = document.createElement('div');
                    const render = module.renderApp ?? module.default;
                    subscription.add(
                        render(appRef.current, { fusion, env: { basename, config, manifest } })
                    );
                },
                complete: () => {
                    setLoading(false);
                },
                error: (err) => {
                    setError(err);
                },
            })
        );
        return () => subscription?.unsubscribe();
    }, [currentApp, ref.current]);

    useEffect(() => {
        const refEl = ref.current;
        const appEl = appRef.current;
        if (!(appEl && refEl)) {
            return;
        }
        refEl.appendChild(appEl);
        return () => {
            try {
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
        return <StarProgress text="Loading Application" />;
    }

    return <section ref={ref}></section>;
};

export default AppLoader;
