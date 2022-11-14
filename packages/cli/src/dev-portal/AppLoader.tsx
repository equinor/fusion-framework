import { useEffect, useRef, useState } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import { ErrorViewer } from './ErrorViewer';

export const AppLoader = (props: { appKey: string }) => {
    const { appKey } = props;
    const fusion = useFramework();
    const ref = useRef<HTMLSpanElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [appModule, setAppModule] = useState<any | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>();

    useEffect(() => {
        setLoading(true);
        const sub = fusion.modules.app.loadApp(appKey).subscribe({
            next: (module) => setAppModule(module),
            error: setError,
            complete: () => {
                setLoading(false);
            },
        });
        return () => sub.unsubscribe();
    }, [appKey]);

    useEffect(() => {
        if (appModule && ref.current) {
            const { manifest, config, module } = appModule;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const renderFn = module.render ?? module.default;
            return renderFn(ref.current, { fusion, env: { manifest, config } });
        }
    }, [fusion, ref, appModule]);

    if (error) {
        return (
            <div>
                <h2>🔥 Failed to load application 🤬</h2>
                <ErrorViewer error={error} />;
            </div>
        );
    }

    return (
        <div>
            {loading && <StarProgress text="Loading Application" />}
            {<span ref={ref} style={{ display: !appModule ? 'none' : '' }}></span>}
        </div>
    );
};

export default AppLoader;
