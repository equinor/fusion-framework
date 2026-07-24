import type { ErrorElementProps } from '@equinor/fusion-framework-react-router';

/**
 * Root-level error boundary — catches anything not handled by child routes.
 * Assigned as `ErrorBoundary` on the root route.
 */
export function RootErrorBoundary({ error }: Partial<ErrorElementProps>) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Unhandled error</h1>
      <p>{message}</p>
    </div>
  );
}
