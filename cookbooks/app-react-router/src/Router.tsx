import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Router } from '@equinor/fusion-framework-react-router';
import { useAppModule } from '@equinor/fusion-framework-react-app';

import routes from './routes';
import Loader from './components/Loader';
import { Api } from './api';

export default function () {
  const httpProvider = useAppModule('http');
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Router routes={routes} context={{ api: new Api(queryClient, httpProvider), queryClient }} />
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
