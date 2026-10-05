import { useEffect, useState } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';

import type { HelpRequest } from './parse-help-request';
import { requestHelpService, type HelpServiceResult } from './request-help-service';
import type { HelpArticle } from './types';

/** Lifecycle of one help article lookup, returned by {@link useHelpArticle}. */
export type HelpArticleState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly article: HelpArticle }
  | Exclude<HelpServiceResult<HelpArticle>, { status: 'loaded' }>;

/**
 * Fetches one help article from the `help` service in service discovery — the local mock
 * served by `ffc mock-server` from a help docs folder, or the real Help service.
 *
 * Each new request object refetches, even for the same article, so edits to a doc show up the
 * next time help is opened or the article is selected in the sidebar.
 *
 * @param request - Current help request; only `article` requests are fetched.
 * @returns The current lookup state.
 *
 * @example
 * ```tsx
 * const state = useHelpArticle({ page: 'article', articleId: 'getting-started' });
 * if (state.status === 'loaded') return <h2>{state.article.title}</h2>;
 * ```
 */
export const useHelpArticle = (request: HelpRequest | undefined): HelpArticleState => {
  const fusion = useFramework();
  const [state, setState] = useState<HelpArticleState>({ status: 'idle' });

  useEffect(() => {
    const articleId = request?.articleId;
    // Nothing to fetch until an article is requested.
    if (!articleId) {
      setState({ status: 'idle' });
      return;
    }
    const controller = new AbortController();
    setState({ status: 'loading' });

    requestHelpService<HelpArticle>(
      fusion.modules.serviceDiscovery,
      `/articles/${encodeURIComponent(articleId)}?$expand=content`,
      { signal: controller.signal },
    ).then((result) => {
      // A newer request or unmount owns the state once this one is aborted.
      if (controller.signal.aborted) return;
      setState(result.status === 'loaded' ? { status: 'loaded', article: result.data } : result);
    });
    return () => controller.abort();
  }, [fusion, request]);

  return state;
};

export default useHelpArticle;
