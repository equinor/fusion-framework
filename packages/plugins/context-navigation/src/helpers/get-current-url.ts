import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

/**
 * Construct the current browser URL from the navigation provider's state.
 *
 * @param navigation - The navigation provider (for reading pathname and search).
 * @param origin - The origin used to construct an absolute URL.
 * @returns An absolute URL representing the current browser location.
 */
export function getCurrentURL(navigation: INavigationProvider, origin: string): URL {
  return new URL(`${navigation.path.pathname}${navigation.path.search ?? ''}`, origin);
}
