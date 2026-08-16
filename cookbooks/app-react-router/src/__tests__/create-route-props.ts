import type { RouteComponentProps } from '@equinor/fusion-framework-react-router';

/**
 * Builds {@link RouteComponentProps} for directly rendering a route's default-exported
 * component in tests, bypassing the router's loader/action pipeline entirely.
 *
 * @remarks
 * Route page components under `src/routes` only read `loaderData` (and occasionally
 * `actionData`); the `fusion` context is used exclusively by their `clientLoader`/`action`
 * functions, which these tests do not exercise. The stubbed `fusion` value is therefore
 * never read by the component under test.
 *
 * @example
 * ```tsx
 * testWithRouter('renders the loaded products', async ({ render }) => {
 *   const props = createRouteProps({ products, categories, filter: null, sort: 'name-asc', inStock: false, productCount: products.length });
 *   const { getByText, unmount } = await render(<ProductsPage {...props} />);
 *   await expect.element(getByText('Products')).toBeInTheDocument();
 *   await unmount();
 * });
 * ```
 *
 * @template TData - The type of data the route's `clientLoader` would have returned.
 * @template TActionData - The type of data the route's `action` would have returned, if any.
 * @param loaderData - The data the route's `clientLoader` would have returned.
 * @param actionData - The data the route's `action` would have returned, if any.
 * @returns Route component props ready to spread onto the route's default export.
 */
export function createRouteProps<TData, TActionData = undefined>(
  loaderData: TData,
  actionData?: TActionData,
): RouteComponentProps<TData, TActionData> {
  // fusion context is never read by these page components, only by their loaders/actions
  return {
    loaderData,
    actionData,
    fusion: {},
  } as unknown as RouteComponentProps<TData, TActionData>;
}

export default createRouteProps;
