import { useEffect, useState } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';

import { requestHelpService, type HelpServiceResult } from './request-help-service.js';
import type { HelpArticle, HelpFaq } from './types.js';

/** Waits this long after the last keystroke before searching, so typing does not flood the service. */
const SEARCH_DEBOUNCE_MS = 250;

/** Fields used to scope a hit to the current app. */
interface HitScope {
  /** Owning app of the document. */
  readonly appKey?: string;
  /** Other apps the document is linked to. */
  readonly linkedAppKeys?: readonly string[];
}

/**
 * One search hit as returned by the Help API search endpoint: an article or an FAQ. `type` is
 * the Help index content type, `Article` or `FAQ`.
 */
export type HelpSearchHit =
  | (HelpArticle & HitScope & { readonly type: 'Article' })
  | (HelpFaq & HitScope & { readonly type: 'FAQ' });

/** A raw search hit before its content type is checked. */
type RawHit = HitScope & { readonly type?: string };

/**
 * Narrows a raw hit to an article or FAQ for the current app.
 *
 * @param hit - Raw search hit.
 * @param appKey - Key of the current app, if an app is loaded.
 * @returns Whether the hit is an article or FAQ that belongs to (or is linked to) the app.
 */
const isAppHit = (hit: RawHit, appKey: string | undefined): hit is HelpSearchHit => {
  // Release notes and other index content types have no view in the dev portal.
  if (hit.type !== 'Article' && hit.type !== 'FAQ') return false;
  // Without an app every hit is relevant; otherwise the owner or a linked app must match.
  if (!appKey) return true;
  const linked = hit.linkedAppKeys ?? [];
  return hit.appKey === appKey || linked.includes(appKey) || (!hit.appKey && linked.length === 0);
};

/** The Help API search response envelope. */
interface HelpSearchResponse {
  readonly value?: readonly RawHit[];
}

/** Lifecycle of one help search, returned by {@link useHelpSearch}. */
export type HelpSearchState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly query: string; readonly hits: readonly HelpSearchHit[] }
  | Exclude<HelpServiceResult<HelpSearchResponse>, { status: 'loaded' }>;

/**
 * Searches help articles through the `help` service's `POST /search` — the local mock's simple
 * term search, or the real Help service — after the query settles for a moment.
 *
 * Hits are articles and FAQs (`type` `Article` or `FAQ`, as in the Help index) owned by or linked
 * to the current app, matching what the sidebar and FAQ page list. Other content types (e.g.
 * release notes) are dropped. A blank query stays idle.
 *
 * @param query - Free-text query as typed.
 * @param appKey - Key of the current app, if an app is loaded.
 * @returns The current search state.
 *
 * @example
 * ```tsx
 * const state = useHelpSearch(query, currentApp?.appKey);
 * ```
 */
export const useHelpSearch = (query: string, appKey: string | undefined): HelpSearchState => {
  const fusion = useFramework();
  const [state, setState] = useState<HelpSearchState>({ status: 'idle' });

  useEffect(() => {
    const search = query.trim();
    // A blank query has nothing to search for.
    if (!search) {
      setState({ status: 'idle' });
      return;
    }
    const controller = new AbortController();
    setState({ status: 'loading' });

    const timer = setTimeout(() => {
      requestHelpService<HelpSearchResponse>(fusion.modules.serviceDiscovery, '/search', {
        method: 'POST',
        body: { search, count: true },
        signal: controller.signal,
      }).then((result) => {
        // A newer query or unmount owns the state once this one is aborted.
        if (controller.signal.aborted) return;
        // Non-loaded outcomes carry their own status and message for the view.
        if (result.status !== 'loaded') return setState(result);
        // Only the current app's articles and FAQs are linkable; other content is dropped.
        const hits = (result.data.value ?? []).filter((hit) => isAppHit(hit, appKey));
        setState({ status: 'loaded', query: search, hits });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fusion, query, appKey]);

  return state;
};

export default useHelpSearch;
