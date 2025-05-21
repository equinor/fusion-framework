import type { AuthenticationResult, PublicClientApplication } from '@azure/msal-node';
import { createServer } from 'node:http';
import URL from 'node:url';

import { AuthServerError, AuthServerTimeoutError } from './error.js';

const DEFAULT_SERVER_TIMEOUT = 300000 as const; // 5 minutes

/**
 * Creates a temporary HTTP server to handle the OAuth 2.0 authorization code flow for interactive authentication.
 *
 * This function is used in interactive authentication scenarios to listen for the authorization code
 * returned by Azure AD after the user authenticates in the browser. It exchanges the code for an access token
 * using the provided `PublicClientApplication` instance. The server automatically shuts down after a successful
 * authentication, error, or timeout.
 *
 * @param client - The MSAL `PublicClientApplication` instance used to acquire tokens.
 * @param scopes - An array of scopes for which the token is requested.
 * @param options - Configuration for the authentication server.
 *   @param options.port - The port on which the server will listen for the authentication response.
 *   @param options.codeVerifier - The PKCE code verifier used for enhanced security (optional).
 *   @param options.timeout - Timeout in milliseconds before the server shuts down if no response is received (default: 5 minutes).
 *
 * @returns A promise that resolves with the `AuthenticationResult` upon successful authentication,
 * or rejects with an error if authentication fails or times out.
 *
 * @throws {@link AuthServerError} If no authorization code is received or if token acquisition fails.
 * @throws {@link AuthServerTimeoutError} If the server times out before receiving a response.
 *
 * @example
 * ```typescript
 * const result = await createAuthServer(client, ['user.read'], { port: 3000, codeVerifier });
 * console.log(result.accessToken);
 * ```
 */
export const createAuthServer = (
  client: PublicClientApplication,
  scopes: string[],
  options: {
    port: number;
    codeVerifier?: string;
    timeout?: number;
  },
): Promise<AuthenticationResult> => {
  const { port, timeout = DEFAULT_SERVER_TIMEOUT } = options;
  return new Promise<AuthenticationResult>((resolve, reject) => {
    // Set a timeout for the server to close if no response is received in time
    const timeoutId = setTimeout(() => {
      server.close();
      reject(new AuthServerTimeoutError('Authentication server timed out'));
    }, timeout);

    // Create a temporary HTTP server to listen for the OAuth 2.0 redirect
    const server = createServer(async (req, res) => {
      // Parse the URL and extract the query parameters from the redirect
      const query = URL.parse(req.url ?? '', true).query;
      if (!query.code) {
        // If no authorization code is present, return an error to the browser and reject the promise
        const error = new AuthServerError('No authorization code received');
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(error.message);
        server.close();
        return reject(error);
      }

      try {
        // Attempt to exchange the authorization code for an access token
        const tokenResponse = await client.acquireTokenByCode({
          code: Array.isArray(query.code) ? query.code[0] : query.code,
          scopes: scopes,
          codeVerifier: options?.codeVerifier,
          redirectUri: `http://localhost:${port}`,
        });
        // On success, notify the user in the browser and resolve the promise
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('Authentication successful! You can close this window.');
        resolve(tokenResponse);
      } catch (err) {
        // If token acquisition fails, return an error to the browser and reject the promise
        const error = new AuthServerError('Authentication failed', { cause: err as Error });
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<b>${error.message}</b><br>${(err as Error).message}`);
        reject(error);
      } finally {
        // Always clean up: close the server and clear the timeout
        server.close();
        clearTimeout(timeoutId);
      }
    }).listen(port);
  });
};

export default createAuthServer;
