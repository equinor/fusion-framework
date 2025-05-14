import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import { useQuery } from '@tanstack/react-query';
import type { FaqArticle } from '../../types';

export const useAppFaqsQuery = (args: {
  appKey: string;
  queryKeys: string[];
  enabled: boolean;
  count?: number;
}) => {
  const { appKey, queryKeys, enabled, count = 10 } = args;

  const httpClient = useHttpClient('help');

  return useQuery({
    initialData: [],
    queryKey: queryKeys,
    enabled: enabled,
    queryFn: async ({ signal }) => {
      const response = await httpClient.json<{ value: FaqArticle[] }>(
        `/apps/${appKey}/faqs?$expand=answer,linkedArticle.content&$top=${count}`,
        {
          signal,
        },
      );

      return response.value;
    },
  });
};
