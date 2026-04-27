import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Router } from '@equinor/fusion-framework-react-router';
import { useAppModule } from '@equinor/fusion-framework-react-app';

import routes from './routes';
import { Api } from './api';

export default function AppRouter() {
  const httpProvider = useAppModule('http');
  const [queryClient] = useState(() => new QueryClient());
  const [api] = useState(() => new Api(queryClient, httpProvider));
  return (
    <QueryClientProvider client={queryClient}>
      <Router routes={routes} context={{ api, queryClient }} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

declare module '@equinor/fusion-framework-react-router' {
  interface RouterContext {
    api: Api;
    queryClient: QueryClient;
  }
}
