import { useState, useEffect } from 'react';
import type { RouteObject } from '@equinor/fusion-framework-react-router';
import type { SidebarLinkProps } from '@equinor/eds-core-react';

export type NavigationItem = {
  label: string;
  icon: SidebarLinkProps['icon'];
  path: string;
};

/**
 * Joins two path segments, handling leading/trailing slashes properly.
 * @param prefix - The prefix path
 * @param path - The path to append
 * @returns The joined path
 */
function joinPaths(prefix: string, path: string | undefined): string {
  if (!path) return prefix;
  return `${prefix.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * Recursively processes route objects to extract navigation items from handles.
 * Only includes routes that have navigation metadata in their handle.
 * Works with RouteObject format (transformed by Vite plugin).
 */
function extractNavigationItems(routes: RouteObject[], currentPath: string = ''): NavigationItem[] {
  const items: NavigationItem[] = [];

  for (const route of routes) {
    // Determine the full path for this route
    let fullPath: string;
    if (route.index) {
      // Index route renders at the parent path
      fullPath = currentPath || '/';
    } else if (route.path) {
      // For routes with a path, join current path with route path
      fullPath = joinPaths(currentPath, route.path);
    } else {
      // Route without path or index (layout route) renders at current path
      fullPath = currentPath || '/';
    }

    // Check if handle has navigation metadata
    const handle = route.handle;
    if (handle?.route?.title && handle?.route?.icon) {
      items.push({
        label: handle.route.title,
        icon: handle.route.icon,
        path: handle.navigation?.path || fullPath,
      });
    }

    // Process children recursively
    if (route.children && route.children.length > 0) {
      const childItems = extractNavigationItems(route.children, fullPath);
      items.push(...childItems);
    }
  }

  return items;
}

/**
 * Hook to extract navigation items from route pages.
 * Works with RouteObject format (transformed by Vite plugin).
 * Handles are already available in the route objects, so no module loading is needed.
 */
export function useNavigationItems(pages: RouteObject[]): NavigationItem[] {
  const [items, setItems] = useState<NavigationItem[]>([]);

  useEffect(() => {
    try {
      const navigationItems = extractNavigationItems(pages);
      setItems(navigationItems);
    } catch (error) {
      console.error('Failed to extract navigation items:', error);
      setItems([]);
    }
  }, [pages]);

  return items;
}
