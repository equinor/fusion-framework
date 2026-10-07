import { useEffect, useState } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';

import { requestHelpService, type HelpServiceResult } from './request-help-service.js';
import type { HelpArticle, HelpArticleCollection } from './types.js';

/** Lifecycle of the sidebar article list, returned by {@link useHelpArticles}. */
export type HelpArticlesState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly articles: readonly HelpArticle[] }
  | Exclude<HelpServiceResult<HelpArticleCollection>, { status: 'loaded' }>;

/**
 * Lists the help articles for the current app, for the help panel's sidebar and home page.
 *
 * Calls `GET /apps/{appKey}/articles`, or `GET /articles` when no app is loaded, and sorts by
 * `sortOrder` then title the way the production help sidebar does. The list is refetched for
 * every `session`, so new or renamed docs show up the next time help is opened.
 *
 * @param appKey - Key of the app whose articles to list, if an app is loaded.
 * @param session - Changes each time the panel is opened by an app; `undefined` while closed.
 * @returns The current list state.
 *
 * @example
 * ```tsx
 * const articles = useHelpArticles(currentApp?.appKey, session);
 * ```
 */
export const useHelpArticles = (
  appKey: string | undefined,
  session: number | undefined,
): HelpArticlesState => {
  const fusion = useFramework();
  const [state, setState] = useState<HelpArticlesState>({ status: 'idle' });

  useEffect(() => {
    // A closed panel needs no article list.
    if (session === undefined) return;
    const controller = new AbortController();
    setState({ status: 'loading' });

    const path = appKey ? `/apps/${encodeURIComponent(appKey)}/articles` : '/articles';
    requestHelpService<HelpArticleCollection>(fusion.modules.serviceDiscovery, path, {
      signal: controller.signal,
    }).then((result) => {
      // A newer session or unmount owns the state once this one is aborted.
      if (controller.signal.aborted) return;
      // Non-loaded outcomes carry their own status and message for the sidebar to show.
      if (result.status !== 'loaded') return setState(result);
      // Sort locally so the sidebar order holds even when the service returns another order.
      const articles = [...(result.data.value ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title),
      );
      setState({ status: 'loaded', articles });
    });
    return () => controller.abort();
  }, [fusion, appKey, session]);

  return state;
};

export default useHelpArticles;
