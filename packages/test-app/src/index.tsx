import { useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import { Framework } from '@equinor/fusion-framework-react';
import { configure } from './config.framework';
import { useFramework } from '@equinor/fusion-framework-react';
import { useAppEnv } from '@equinor/fusion-framework-react/app';
import type { AppConfig, AppManifest } from '@equinor/fusion-framework-react/app';

const AppLoader = (props: { appKey: string }) => {
    const { appKey } = props;
    const fusion = useFramework();
    const ref = useRef<HTMLSpanElement>(null);
    const renderRef = useRef<VoidFunction | undefined>(undefined);

    const { config, manifest, isLoading } = useAppEnv(appKey);

    const loadApp = useCallback(
        async (manifest: AppManifest, config: AppConfig) => {
            const { render } = await import('./App');
            if (ref.current) {
                return render(ref.current, { fusion, env: { manifest, config } });
            }
        },
        [ref, fusion]
    );

    useEffect(() => {
        if (!isLoading && manifest && config) {
            loadApp(manifest, config).then((x) => (renderRef.current = x));
        }
        return renderRef.current;
    }, [loadApp, isLoading, manifest, config]);

    return <span ref={ref}></span>;
};

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <Framework configure={configure} fallback={<StarProgress text="Loading framework" />}>
            <AppLoader appKey="test-app" />
        </Framework>
    </ThemeProvider>,
    document.getElementById('root')
);
