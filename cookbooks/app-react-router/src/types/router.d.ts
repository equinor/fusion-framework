import type { RouterHandle as BaseRouterHandle } from '@equinor/fusion-framework-react-router';
import type { IconData } from '@equinor/eds-icons';

/**
 * Extended RouterHandle with navigation metadata for generating navigation menus
 */
declare module '@equinor/fusion-framework-react-router' {
  interface RouterHandle extends BaseRouterHandle {
    /**
     * Navigation metadata for this route
     * If provided, this route will appear in the navigation menu
     */
    navigation?: {
      /** Display label for the navigation item */
      label: string;
      /** Icon to display in the navigation */
      icon: IconData;
      /** Path for navigation (defaults to route path) */
      path?: string;
    };
  }
}

