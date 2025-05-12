import { useCallback } from 'react';
import useAppModule from '../useAppModule';

type HelpCenterEventDetailBase<T extends string, V extends Record<string, unknown> = {}> = {
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

export const useHelpCenter = () => {
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
