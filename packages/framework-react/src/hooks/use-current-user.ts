import { useFramework } from './use-framework';

export type AccountInfo = {
    // homeAccountId: string;
    environment: string;
    tenantId: string;
    username: string;
    localAccountId: string;
    name?: string;
};

export const useCurrentUser = (): AccountInfo | undefined => {
    const framework = useFramework();
    return framework.modules.auth.client.account;
};
