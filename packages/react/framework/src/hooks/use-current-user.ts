import { AccountInfo } from '@equinor/fusion-framework-module-msal';
import { useFramework } from '../useFramework';

export const useCurrentUser = (): AccountInfo | undefined => {
  const framework = useFramework();
  return framework.modules.auth.defaultAccount;
};
