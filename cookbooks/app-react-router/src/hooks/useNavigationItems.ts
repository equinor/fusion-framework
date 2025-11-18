import { useState, useEffect } from 'react';
import type { RouteNode } from '@equinor/fusion-framework-react-router';
import type { RouterHandle } from '@equinor/fusion-framework-react-router';
import type { SidebarLinkProps } from '@equinor/eds-core-react';
import { IndexRoute, Route, PrefixRoute } from '@equinor/fusion-framework-react-router/routes';

export type NavigationItem = {
  label: string;
  icon: SidebarLinkProps['icon'];
  path: string;
};

/**
 * Recursively processes route nodes to extract navigation items from handles.
 * Only includes routes that have navigation metadata in their handle.
 */
async function extractNavigationItems(
  nodes: RouteNode[],
  currentPath: string = '',
): Promise<NavigationItem[]> {
  const items: NavigationItem[] = [];

  for (const node of nodes) {
    if (node instanceof IndexRoute || node instanceof Route) {
      // Calculate the full path for this route
      let fullPath: string;
      if (node instanceof IndexRoute) {
        // Index route renders at the parent path
        fullPath = currentPath || '/';
      } else {
        // For Route, join current path with route path
        // Route paths are relative and shouldn't have leading slashes
        const routePath = node.path.replace(/^\//, '');
        if (currentPath) {
          // Remove trailing slash from currentPath and add route path
          const cleanCurrentPath = currentPath.replace(/\/$/, '');
          fullPath = `${cleanCurrentPath}/${routePath}`;
        } else {
          fullPath = `/${routePath}`;
        }
      }

      // Load the module to get the handle
      // IndexRoute and Route both extend BaseFileRoute and have a file property
      try {
        const module = await import(/* @vite-ignore */ node.file);
        const handle = (module.handle as RouterHandle) || { route: {} };

        // If handle has navigation metadata, add it to items
        if (handle.navigation) {
          items.push({
            label: handle.navigation.label,
            icon: handle.navigation.icon,
            path: handle.navigation.path || fullPath,
          });
        }
      } catch (error) {
        // Silently skip routes that fail to load
        console.warn(`Failed to load route module: ${node.file}`, error);
      }

      // Process children recursively
      if (node instanceof Route && node.children && node.children.length > 0) {
        const childItems = await extractNavigationItems(node.children, fullPath);
        items.push(...childItems);
      }
    } else if (node instanceof PrefixRoute) {
      // For prefix routes, update the current path and process children
      const newPath = currentPath
        ? `${currentPath}/${node.path}`
        : `/${node.path}`;
      const childItems = await extractNavigationItems(node.children, newPath);
      items.push(...childItems);
    }
  }

  return items;
}

// Cache to avoid re-loading modules
const navigationCache = new WeakMap<RouteNode[], Promise<NavigationItem[]>>();

/**
 * Hook to extract navigation items from route pages.
 * Loads route modules to extract navigation metadata from handles.
 * Results are cached to avoid re-loading modules.
 */
export function useNavigationItems(pages: RouteNode[]): NavigationItem[] {
  const [items, setItems] = useState<NavigationItem[]>([]);

  useEffect(() => {
    // Check cache first
    let promise = navigationCache.get(pages);
    if (!promise) {
      promise = extractNavigationItems(pages);
      navigationCache.set(pages, promise);
    }

    promise
      .then((loadedItems) => {
        setItems(loadedItems);
      })
      .catch((error) => {
        console.error('Failed to extract navigation items:', error);
        setItems([]);
      });
  }, [pages]);

  return items;
}

