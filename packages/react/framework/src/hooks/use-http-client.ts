import { useMemo } from 'react';
import type { Fusion } from '@equinor/fusion-framework';
import { useFramework } from '../useFramework';

type HttpClient = ReturnType<Fusion['modules']['http']['createClient']>;
type FrameworkHttpClient = 'portal' | 'people';

export const useHttpClient = (name: FrameworkHttpClient): HttpClient => {
  const framework = useFramework();

  const client = useMemo(() => {
    if (framework.modules.http.hasClient(name)) {
      return framework.modules.http.createClient(name);
    }
    throw Error(`no configured client for key [${name}]`);
  }, [framework, name]);
  // TODO - abort on unmount?
  return client;
};
