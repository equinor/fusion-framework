import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { combineLatest, from, Subscription } from 'rxjs';

import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import { Framework } from '@equinor/fusion-framework-react';
import { configure } from './config.framework';
import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import { AppModule } from '@equinor/fusion-framework-module-app';

const AppLoader = (props: { appKey: string }) => {
    const { appKey } = props;
    const fusion = useFramework<[AppModule]>();

    const { currentApp, setCurrentApp } = useCurrentApp();

    const ref = useRef<HTMLElement>(null);
    const appRef = useRef<HTMLDivElement>(document.createElement('div'));

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>();

    useEffect(() => {
        setCurrentApp(appKey);
    }, [appKey]);

    useEffect(() => {
        setLoading(true);
        setError(undefined);
        if (!currentApp) {
            return;
        }
        const subscription = new Subscription();
        subscription.add(
            combineLatest([
                currentApp.getManifest(),
                from(import('./App')),
                currentApp.getConfig(),
            ]).subscribe({
                next: ([manifest, module, config]) => {
                    const [basename] = window.location.pathname.match(
                        /\/?apps\/[a-z|-]+(\/)?/g
                    ) ?? [''];
                    appRef.current = document.createElement('div');
                    const render = module.render ?? module.default;
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
        return <pre>{JSON.stringify(error)}</pre>;
    }

    if (loading) {
        return <StarProgress text="Loading Application" />;
    }

    return <section ref={ref}></section>;
};

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <Framework configure={configure} fallback={<StarProgress text="Loading framework" />}>
            <AppLoader appKey="test-app" />
        </Framework>
    </ThemeProvider>,
    document.getElementById('root')
);
