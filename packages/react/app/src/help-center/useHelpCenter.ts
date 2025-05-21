import { useCallback } from 'react';
import useAppModule from '../useAppModule';

type HelpCenterEventDetailBase<
  T extends string,
  V extends Record<string, unknown> = Record<string, unknown>,
> = {
  page: T;
} & V;

type OpenHelpDetail = HelpCenterEventDetailBase<'home'>;

type OpenArticleDetail = HelpCenterEventDetailBase<
  'article',
  {
    articleId: string;
  }
>;

type OpenFaqsDetail = HelpCenterEventDetailBase<'faqs'>;

type OpenSearchDetail = HelpCenterEventDetailBase<
  'search',
  {
    search: string;
  }
>;

type OpenGovernanceDetail = HelpCenterEventDetailBase<'governance'>;

export type HelpCenterOpenEventDetail =
  | OpenHelpDetail
  | OpenArticleDetail
  | OpenFaqsDetail
  | OpenSearchDetail
  | OpenGovernanceDetail;

export const EVENT_NAME = '@Portal::FusionHelp::open';

/**
 * Interface for requesting help features.
 */
export interface HelpCenter {
  /**
   * Requesting the portal to open the help sidesheet on the normal page
   */
  openHelp(): void;

  /**
   * Requesting the portal to open the help sidesheet on the article page.
   *
   * @param {string} articleId - The articleId, slug or identifier to show.
   */
  openArticle(articleId: string): void;

  /**
   * Requesting the portal to open the help sidesheet on the FAQs page.
   */
  openFaqs(): void;

  /**
   * Requesting the portal to open the help sidesheet on the search page.
   *
   * @param {string} search - The search string.
   */
  openSearch(search: string): void;

  /**
   * Requesting the portal to open the help sidesheet on the governance tab.
   */
  openGovernance(): void;
}

/**
 * Hook for accessing help center.
 */
export const useHelpCenter = (): HelpCenter => {
  const eventModule = useAppModule('event');

  const openHelp = useCallback((): void => {
    eventModule.dispatchEvent(EVENT_NAME, {
      detail: {
        page: 'home',
      },
    });
  }, [eventModule.dispatchEvent]);

  const openArticle = useCallback(
    (articleId: string): void => {
      eventModule.dispatchEvent(EVENT_NAME, {
        detail: {
          page: 'article',
          articleId: articleId,
        },
      });
    },
    [eventModule.dispatchEvent],
  );

  const openFaqs = useCallback((): void => {
    eventModule.dispatchEvent(EVENT_NAME, {
      detail: {
        page: 'faqs',
      },
    });
  }, [eventModule.dispatchEvent]);

  const openSearch = useCallback(
    (search: string): void => {
      eventModule.dispatchEvent(EVENT_NAME, {
        detail: {
          page: 'search',
          search: search,
        },
      });
    },
    [eventModule.dispatchEvent],
  );

  const openGovernance = useCallback((): void => {
    eventModule.dispatchEvent(EVENT_NAME, {
      detail: {
        page: 'governance',
      },
    });
  }, [eventModule.dispatchEvent]);

  return {
    openHelp,
    openArticle,
    openFaqs,
    openSearch,
    openGovernance,
  };
};

export default useHelpCenter;
