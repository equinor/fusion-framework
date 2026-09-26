import type { ReactElement } from 'react';
import { Outlet } from '@equinor/fusion-framework-react-router';

/**
 * Renders the shared outlet for product list and detail routes.
 * @returns The nested products route layout.
 */
export default function ProductsLayout(): ReactElement {
  return <Outlet />;
}
