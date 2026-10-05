import { useEffect, useState } from 'react';

import { useFramework } from '@equinor/fusion-framework-react';

import type { HelpRequest } from './parse-help-request';
import { requestHelpService, type HelpServiceResult } from './request-help-service';
import type { HelpFaq, HelpFaqCollection } from './types';

/** Lifecycle of the FAQ list, returned by {@link useHelpFaqs}. */
export type HelpFaqsState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'loaded'; readonly faqs: readonly HelpFaq[] }
  | Exclude<HelpServiceResult<HelpFaqCollection>, { status: 'loaded' }>;

/**
 * Lists the FAQs for the current app from the `help` service — the local mock served by
 * `ffc mock-server` from the help docs' `faqs` folder, or the real Help service.
 *
 * Calls `GET /apps/{appKey}/faqs?$expand=answer` (or `/faqs` when no app is loaded) — the Help
 * API only includes answers when expanded — sorted by `sortOrder` then question. Each new FAQ page
 * request refetches, so edited FAQs show up the next time the page is opened.
 *
 * @param appKey - Key of the app whose FAQs to list, if an app is loaded.
 * @param request - Current FAQ page request; `undefined` stays idle.
 * @returns The current list state.
 *
 * @example
 * ```tsx
 * const faqs = useHelpFaqs('my-app', { page: 'faqs' });
 * ```
 */
export const useHelpFaqs = (
  appKey: string | undefined,
  request: HelpRequest | undefined,
): HelpFaqsState => {
  const fusion = useFramework();
  const [state, setState] = useState<HelpFaqsState>({ status: 'idle' });

  useEffect(() => {
    // Nothing to list until the FAQ page is requested.
    if (!request) {
      setState({ status: 'idle' });
      return;
    }
    const controller = new AbortController();
    setState({ status: 'loading' });

    const list = appKey ? `/apps/${encodeURIComponent(appKey)}/faqs` : '/faqs';
    const path = `${list}?$expand=answer`;
    requestHelpService<HelpFaqCollection>(fusion.modules.serviceDiscovery, path, {
      signal: controller.signal,
    }).then((result) => {
      // A newer request or unmount owns the state once this one is aborted.
      if (controller.signal.aborted) return;
      // Non-loaded outcomes carry their own status and message for the view.
      if (result.status !== 'loaded') return setState(result);
      // Sort locally so the order holds even when the service returns another order.
      const faqs = [...(result.data.value ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.question.localeCompare(b.question),
      );
      setState({ status: 'loaded', faqs });
    });
    return () => controller.abort();
  }, [fusion, appKey, request]);

  return state;
};

export default useHelpFaqs;
