import { useEffect, useMemo, useRef, useState } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';

import type { FusionApploaderProps as ApploaderProps } from './FusionApploader';

export const useAppLoader = ({appKey}: ApploaderProps): {
  loading: boolean;
  error: Error | undefined;
  appRef: React.RefObject<HTMLDivElement | null>;
} => {
  const [loading, setLoading] = useState(false);
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
      next: ({ manifest, script, config }) => {
        /* Application Element for mounting */
        appRef.current = document.createElement('div');
        appRef.current.id = manifest.appKey;
        appRef.current.style.display = "contents";
        
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
          throw Error("Application is not supported, no render function provided");
        } catch (error) {
          console.error("App loading Error: ", error);
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
