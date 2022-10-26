import { Suspense, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import { ThemeProvider, theme } from '@equinor/fusion-react-styles';

import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import Framework from './Framework';
import { useFramework } from '@equinor/fusion-framework-react/hooks';

const AppLoader = () => {
    const fusion = useFramework();
    const ref = useRef<HTMLSpanElement>(null);
    const renderRef = useRef<VoidFunction | undefined>(undefined);
    const loadApp = useCallback(async () => {
        const { render } = await import('./App');
        if (ref.current) {
            return render(ref.current, { fusion, env: {} });
        }
    }, [ref, fusion]);

    useEffect(() => {
        loadApp().then((x) => (renderRef.current = x));
        return renderRef.current;
    }, [loadApp]);

    return <span ref={ref}></span>;
};

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <Suspense fallback={<StarProgress text="Loading framework" />}>
            <Framework>
                <AppLoader />
            </Framework>
        </Suspense>
    </ThemeProvider>,
    document.getElementById('root')
);
