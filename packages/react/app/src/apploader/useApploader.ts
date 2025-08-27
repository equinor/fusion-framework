import { useEffect, useMemo, useRef, useState } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';

import type { ApploaderProps } from './Apploader';
import type { AppInitializeResult } from '@equinor/fusion-framework-module-app/app';

/**
 * React hook for dynamically loading and mounting a Fusion child app inside a parent Fusion app.
 * Handles loading state, error reporting, and provides a reference to the mounted app’s DOM element.
 *
 * @param { Object } params
 * @param { string } params.appKey - The key of the Fusion app to load and mount.
 * @returns {{
 *   loading: boolean,
 *   error: Error | undefined,
 *   appRef: React.RefObject<HTMLDivElement | null>
 * }} An object containing loading state, error, and a ref to the mounted app element.
 *
 * @example
 * ```typescript
 * const { loading, error, appRef } = useApploader({ appKey: 'my-app' });
 *
 * useEffect(() => {
 *   if (containerRef.current && appRef.current) {
 *     containerRef.current.appendChild(appRef.current);
 *   }
 * }, [appRef.current]);
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div ref={containerRef} />;
 * ```
 */
export const useApploader = ({
  appKey,
}: ApploaderProps): {
  loading: boolean;
  error: Error | undefined;
  appRef: React.RefObject<HTMLDivElement | null>;
} => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const appRef = useRef<HTMLDivElement | null>(null);
  const fusion = useFramework<[AppModule]>();

  /**
   * The current fusion app.
   * aka the parent app that is loading the child app.
   */
  const fusionApp = useMemo(() => fusion.modules.app.current, [fusion]);

  /**
   * The app to be mounted
   * aka the child app that is being loaded.
   */
  const loadedApp = useMemo(() => fusion.modules.app.createApp({ appKey }), [fusion, appKey]);

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    const subscription$ = loadedApp?.initialize().subscribe({
      next: (instance: AppInitializeResult) => {
        const { manifest, script, config } = instance;
        /* Application Element for mounting */
        appRef.current = document.createElement('div');
        appRef.current.id = manifest.appKey;
        appRef.current.style.display = 'contents';

        /* Use basename of current fusionApp */
        const basename = `/apps/${fusionApp?.appKey}`;

        try {
          const render = script.renderApp ?? script.default;
          if (render) {
            return render(appRef.current, {
              fusion,
              env: { basename, config, manifest, props: {} },
            });
          }
          throw Error('Application is not supported, no render function provided');
        } catch (error) {
          console.error('App loading Error: ', error);
          setError(error as Error);
        }
      },
      complete: () => {
        setLoading(false);
      },
      error: (error: Error) => {
        setError(error);
        setLoading(false);
      },
    });
    return () => {
      subscription$.unsubscribe();
    };
  }, [fusionApp, loadedApp, fusion]);

  return {
    loading,
    error,
    appRef,
  };
};
