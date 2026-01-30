import type { IconData } from '@equinor/eds-icons';

/**
 * Extended RouterHandle with navigation metadata for generating navigation menus
 */
declare module '@equinor/fusion-framework-react-router' {
  interface RouterSchema {
    /** Display title for the route (used in navigation) */
    title?: string;
    /** Icon to display in the navigation */
    icon?: IconData;
  }
}
