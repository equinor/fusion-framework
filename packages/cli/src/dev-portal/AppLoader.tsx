import { useCallback, useEffect, useRef } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';
import { AppConfig, AppManifest, useAppEnv } from '@equinor/fusion-framework-react/app';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

export const AppLoader = (props: { appKey: string }) => {
    const { appKey } = props;
    const fusion = useFramework();
    const ref = useRef<HTMLSpanElement>(null);
    const renderRef = useRef<VoidFunction | undefined>(undefined);

    const { config, manifest, isLoading } = useAppEnv(appKey);

    const loadApp = useCallback(
        async (manifest: AppManifest, config: AppConfig) => {
            const url = new URL('/index.tsx', import.meta.url).href;
            const module = await import(url);
            const renderFn = module.render ?? module.default;
            if (ref.current) {
                return renderFn(ref.current, { fusion, env: { manifest, config } });
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

    return (
        <div>
            {isLoading && <StarProgress text="Loading Application" />}
            <span ref={ref} style={{ display: isLoading ? 'none' : '' }}></span>
        </div>
    );
};

export default AppLoader;
