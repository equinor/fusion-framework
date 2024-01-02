import { AuthRequest } from '@equinor/fusion-framework-module-msal/client';
import { useToken } from './useToken';

/**
 * Custom hook that retrieves an access token for the specified authentication request.
 *
 * @param req - The authentication request.
 * @returns An object containing the access token, pending state, and error.
 */
export const useAccessToken = (
    req: AuthRequest,
): { token?: string; pending: boolean; error: unknown } => {
    const { token, error, pending } = useToken(req);
    return { token: token?.accessToken, pending, error };
};
