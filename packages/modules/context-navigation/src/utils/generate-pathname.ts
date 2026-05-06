import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';

/**
 * Generates a new pathname based on the current context and item.
 *
 * If a `pathContextId` is provided and exists in the current pathname, it replaces it with the new context item's ID.
 * Otherwise, it generates a new path using the context provider's `generatePathFromContext` method if available,
 * or defaults to a path with the item's ID.
 *
 * @param currentPathname - The current URL pathname.
 * @param item - The context item containing the new context ID.
 * @param context - (Optional) The context provider, which may provide a custom path generation method.
 * @param pathContextId - (Optional) The context ID currently present in the URL, to be replaced.
 * @returns The generated pathname reflecting the new context.
 */
export const generatePathname = (
  currentPathname: string,
  item: ContextItem,
  context?: IContextProvider,
  pathContextId?: string,
) => {
  if (pathContextId) {
    // context id exists in the url, replace it with the new context id

    console.debug(`🌍 Portal: generatePathFromContext!`, !!context?.generatePathFromContext);

    const pathname =
      context?.generatePathFromContext?.(item, currentPathname) ??
      currentPathname.replace(pathContextId, item.id);

    console.debug(
      `🌍 Portal: Context changed, navigating to app's context url:`,
      `found context id [${pathContextId}] in url, replacing with [${pathname}]`,
    );

    return pathname;
  }

  if (!context) {
    return '/';
  }
  // could not find context id in the url, set the path to the new context id
  const pathname = context?.generatePathFromContext?.(item, currentPathname) ?? `/${item?.id}`;

  console.debug(
    `🌍 Portal: Context changed, navigating to app's context url:`,
    `could not find context id in url, navigating to path [${pathname}]`,
  );

  return pathname;
};
