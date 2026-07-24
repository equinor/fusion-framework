import type { ErrorElementProps } from '@equinor/fusion-framework-react-router';

/** Throws during the loader — caught by the route's `errorElement`. */
export async function clientLoader(): Promise<never> {
  throw new Error('Loader blew up — errorElement should catch this');
}

export function ErrorElementPage() {
  // This component never renders because clientLoader always throws.
  return <p>This text should never appear.</p>;
}

/**
 * Passed as `errorElement: ErrorElementBoundary` on the route.
 *
 * The Fusion router wraps this component and injects `error` and `fusion` as
 * props. Note: pass the component reference, NOT a rendered element.
 */
export function ErrorElementBoundary({ error }: ErrorElementProps) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div style={{ border: '2px solid crimson', padding: '1rem', borderRadius: '4px' }}>
      <h2>Caught by errorElement</h2>
      <p>
        <strong>Error:</strong> {message}
      </p>
      <p>
        <code>fusion</code> context is also available via props.
      </p>
    </div>
  );
}
