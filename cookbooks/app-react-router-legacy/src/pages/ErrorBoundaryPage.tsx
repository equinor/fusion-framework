import type { ErrorElementProps } from '@equinor/fusion-framework-react-router';

/** Throws during render — caught by the route's `ErrorBoundary`. */
export function ErrorBoundaryPage(): never {
  throw new Error('Render blew up — ErrorBoundary should catch this');
}

/**
 * Passed as `ErrorBoundary: ErrorBoundaryComponent` on the route.
 *
 * React Router v7 style: the component can call `useRouteError()` internally.
 * The Fusion router additionally injects `error` and `fusion` as props for
 * convenience — you can use either approach.
 */
export function ErrorBoundaryComponent({ error }: Partial<ErrorElementProps>) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div style={{ border: '2px solid darkorange', padding: '1rem', borderRadius: '4px' }}>
      <h2>Caught by ErrorBoundary</h2>
      <p>
        <strong>Error:</strong> {message}
      </p>
      <p>
        <code>fusion</code> context is also available via props.
      </p>
    </div>
  );
}
