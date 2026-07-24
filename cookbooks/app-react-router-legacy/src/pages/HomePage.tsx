import { Link } from '@equinor/fusion-framework-react-router';

export function HomePage() {
  return (
    <div>
      <h1>RouteObject[] (legacy) router cookbook</h1>
      <p>
        This cookbook demonstrates the manual <code>RouteObject[]</code> approach to Fusion
        routing — the alternative to the DSL (<code>route()</code> / <code>layout()</code>).
      </p>
      <ul>
        <li>
          <Link to="/error-element">
            <strong>errorElement demo</strong>
          </Link>{' '}
          — route throws in the loader; caught by <code>errorElement: MyComponent</code>
        </li>
        <li>
          <Link to="/error-boundary">
            <strong>ErrorBoundary demo</strong>
          </Link>{' '}
          — route throws during render; caught by <code>ErrorBoundary: MyComponent</code>
        </li>
      </ul>
    </div>
  );
}
