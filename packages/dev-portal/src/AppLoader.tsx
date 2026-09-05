import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Subscription } from 'rxjs';
import { last } from 'rxjs/operators';

import { useFramework } from '@equinor/fusion-framework-react';
import { RoleBoundary } from '@equinor/fusion-framework-react-components-roles';
import {
  ErrorBoundary,
  type FallbackProps,
  useErrorBoundary,
} from '@equinor/fusion-react-errorboundary';

import { useObservableState } from '@equinor/fusion-observable/react';

import { AppManifestError } from '@equinor/fusion-framework-module-app/errors.js';

import { ErrorViewer } from './ErrorViewer';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import EquinorLoader from './EquinorLoader';
import { getAppTagFromUrl } from './get-app-tag-from-url';

/**
 * Loads, initializes, and mounts a Fusion application by its key.
 *
 * Sets the current app on the framework's app module, observes initialization
 * progress, and renders the app's script output into a private DOM element.
 * Displays a loading spinner while the app initializes and an error view if
 * manifest resolution or initialization fails.
 *
 * @param props.appKey - Unique key identifying the Fusion application to load.
 */
const AppLoaderContent = (props: { readonly appKey: string }): ReactNode => {
  const { appKey } = props;
  const fusion = useFramework<[AppModule]>();
  const { showBoundary } = useErrorBoundary();

  /** reference of application section/container */
  const ref = useRef<HTMLElement>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // TODO(#5087): change to `useCurrentApp`
  /** observe and use the current selected application from framework */
  const { value: currentApp } = useObservableState(
    useMemo(() => fusion.modules.app.current$, [fusion.modules.app]),
  );

  useEffect(() => {
    const tag = getAppTagFromUrl();
    const selectedApp = fusion.modules.app.current;

    // A boundary retry must reuse the current app instead of disposing it before initialization.
    if (selectedApp?.appKey === appKey && (selectedApp.tag ?? null) === tag) {
      return;
    }
    // A `$tag` URL param takes precedence over the plain appKey
    if (tag) {
      fusion.modules.app.setCurrentApp({ appKey, tag });
      return;
    }
    /** when appKey property change, assign it to current */
    fusion.modules.app.setCurrentApp(appKey);
  }, [appKey, fusion]);

  useEffect(() => {
    /** flag that application is loading */
    setLoading(true);

    /** create a teardown of load */
    const subscription = new Subscription();

    /** make sure that initialize is canceled and disposed if current app changes  */
    subscription.add(
      currentApp
        ?.initialize()
        .pipe(last())
        .subscribe({
          next: ({ manifest, script, config }) => {
            /** generate basename for application */
            const [basename] = window.location.pathname.match(/\/?apps\/[a-z|-]+(\/)?/g) ?? [''];

            /** create a 'private' element for the application */
            const el = document.createElement('div');
            // Guard against rendering before the mounting ref has attached
            if (!ref.current) {
              throw Error('Missing application mounting point');
            }

            ref.current.appendChild(el);

            /** extract render callback function from javascript module */
            const render = script.renderApp ?? script.default;

            /** add application teardown to current render effect teardown */
            subscription.add(
              render(el, {
                fusion,
                env: { basename, config, manifest },
                // React module initialization happens after render returns, so route failures back
                // into the host boundary instead of leaving the application on its Suspense fallback.
                onError: (renderError) => {
                  showBoundary(
                    renderError instanceof Error
                      ? renderError
                      : new Error('Application rendering failed.', { cause: renderError }),
                  );
                },
              }),
            );

            /** remove app element when application unmounts */
            subscription.add(() => el.remove());
          },
          complete: () => {
            /** flag that application is no longer loading */
            setLoading(false);
          },
          error: (err) => {
            showBoundary(err);
          },
        }),
    );

    /** teardown application when hook unmounts */
    return () => subscription.unsubscribe();
  }, [fusion, currentApp, showBoundary]);

  return (
    <section id="app-section" ref={ref} style={{ display: 'contents' }}>
      {loading && <EquinorLoader text="Loading Application" />}
    </section>
  );
};

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error('Application loading failed.', { cause: error });

/**
 * Selects the host fallback for any uncaught application error.
 *
 * @param props - Error-boundary fallback data.
 * @returns The matching generic host error view.
 */
const AppLoaderFallback = ({ error }: FallbackProps): ReactNode => {
  const applicationError = toError(error);
  // Manifest errors retain their dedicated guidance because they fail before app code is available.
  if (applicationError.cause instanceof AppManifestError) {
    return (
      <div>
        <h2>🔥 Failed to load application manifest 🤬</h2>
        <h3>{applicationError.cause.type}</h3>
        <ErrorViewer error={applicationError} />
      </div>
    );
  }
  return (
    <div>
      <h2>🔥 Failed to load application 🤬</h2>
      <ErrorViewer error={applicationError} />
    </div>
  );
};

/**
 * Loads an application inside the shared catch-all error boundary.
 *
 * @param props.appKey - Unique key identifying the Fusion application to load.
 */
export const AppLoader = ({ appKey }: { readonly appKey: string }): ReactNode => (
  <ErrorBoundary key={appKey} fallbackRender={AppLoaderFallback}>
    <RoleBoundary>
      <AppLoaderContent appKey={appKey} />
    </RoleBoundary>
  </ErrorBoundary>
);

export default AppLoader;
