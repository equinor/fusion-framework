/// <reference lib="webworker" />

import type { ResourceConfiguration } from '../types.js';

/**
 * Represents an authentication token with an access token and its expiration time.
 */
type Token = {
  accessToken: string;
  expiresOn: number;
};

/**
 * A cache structure for storing tokens, where each token is associated with a unique string key.
 *
 * @typeParam string - The key used to identify a token in the cache.
 * @typeParam Token - The type of the token being stored in the cache.
 */
type TokenCache = Map<string, Token>;

/**
 * A reference to the global scope of the service worker.
 *
 * The `self` variable is explicitly cast to `ServiceWorkerGlobalScope` to ensure
 * type safety and provide access to service worker-specific APIs.
 *
 * This is necessary because `globalThis` is a generic global object and does not
 * include service worker-specific properties and methods by default.
 */
const self = globalThis as unknown as ServiceWorkerGlobalScope;

/**
 * An array of settings used for token injection.
 * Each setting defines the configuration for injecting tokens
 * into the application, such as authentication or API tokens.
 */
let resourceConfigurations: ResourceConfiguration[] = [];

/**
 * A cache for storing tokens, implemented as a `Map`.
 * This cache is used to temporarily hold tokens for quick retrieval.
 *
 * @type {TokenCache} - A `Map` instance where the keys and values are determined by the `TokenCache` type definition.
 */
const tokenCache: TokenCache = new Map();

/**
 * Generates a unique key by sorting and concatenating an array of scope strings.
 *
 * @param scopes - An array of strings representing the scopes to be processed.
 * @returns A single string representing the sorted and concatenated scopes, separated by commas.
 */
function getScopeKey(scopes: string[]): string {
  return scopes.sort().join(',');
}

/**
 * Checks if a token associated with the specified scopes is valid.
 *
 * This function determines the validity of a token by checking if it exists
 * in the token cache and if its expiration time has not been reached.
 *
 * @param scopes - An array of strings representing the scopes for which the token is required.
 * @returns `true` if a valid token exists for the given scopes; otherwise, `false`.
 */
function isTokenValid(scopes: string[]): boolean {
  const scopeKey = getScopeKey(scopes);
  if (!tokenCache.has(scopeKey)) {
    return false;
  }
  const tokenData = tokenCache.get(scopeKey);
  return tokenData !== undefined && Date.now() < tokenData.expiresOn;
}

/**
 * Requests an access token from a client using the Service Worker's `clients` API.
 * Communicates with the client via a `MessageChannel` to retrieve the token.
 *
 * @param scopes - An array of strings representing the scopes for which the token is requested.
 * @returns A promise that resolves to the token object containing the `accessToken` and `expiresOn` properties.
 * @throws An error if no clients are available or if the client responds with an error.
 *
 * @example
 * ```typescript
 * const token = await requestTokenFromClient(['scope1', 'scope2']);
 * console.log(token.accessToken); // Access token string
 * console.log(token.expiresOn);  // Expiration timestamp
 * ```
 */
async function requestTokenFromClient(scopes: string[]): Promise<Token> {
  const clients = await self.clients.matchAll();

  // ensure there are clients available
  if (clients.length === 0) {
    throw new Error('No clients available');
  }

  // create a message channel to communicate with the client
  const messageChannel = new MessageChannel();
  const token = await new Promise<Token>((resolve, reject) => {
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(event.data.error);
      }
      resolve(event.data as { accessToken: string; expiresOn: number });
    };
    clients[0].postMessage({ type: 'GET_TOKEN', scopes }, [messageChannel.port2]);
  });

  if (!token) {
    throw new Error('No token received');
  }

  // store the token in the cache
  tokenCache.set(getScopeKey(scopes), token);

  return token;
}

/**
 * Retrieves an access token for the specified scopes. If no valid token is found,
 * it requests a new one from the client.
 *
 * @param scopes - An array of strings representing the required scopes for the token.
 * @returns A promise that resolves to the access token as a string.
 * @throws An error if no access token is found after attempting to retrieve or request one.
 */
async function getToken(scopes: string[]): Promise<string> {
  // if no valid token is found, request a new one
  if (!isTokenValid(scopes)) {
    await requestTokenFromClient(scopes);
  }
  const scopeKey = getScopeKey(scopes);
  const { accessToken } = tokenCache.get(scopeKey) || {};
  if (!accessToken) {
    throw new Error('No access token found');
  }
  return accessToken;
}

// Match request to proxy config
/**
 * Retrieves the matching token injection configuration for a given URL.
 *
 * @param url - The URL to match against the token injection settings.
 * @returns The matching `TokenInjectionSetting` if found, otherwise `undefined`.
 *
 * The function compares the provided URL with the `url` property of each
 * `TokenInjectionSetting` in the `tokenInjectionSettings` array. If the
 * provided URL starts with the resolved `config.url`, it is considered a match.
 *
 * Note:
 * - If `config.url` starts with a `/`, it is resolved relative to the service
 *   worker's origin (`self.location.origin`).
 * - The comparison is performed using fully resolved absolute URLs.
 */
function getMatchingConfig(url: string): ResourceConfiguration | undefined {
  return resourceConfigurations.find((config) => {
    const configUrl = new URL(
      config.url,
      config.url.startsWith('/') ? self.location.origin : undefined,
    ).href;
    const requestUrl = new URL(url, self.location.origin).href;
    return requestUrl.startsWith(configUrl);
  });
}

// Install event
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(self.skipWaiting());
});

// Activate event
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

// Handle configuration from main thread
self.addEventListener('message', async (event: ExtendableMessageEvent) => {
  const { type, config } = event.data;
  if (type === 'INIT_CONFIG') {
    resourceConfigurations = config as ResourceConfiguration[];
    
    // CRITICAL: Force skipWaiting() and claim clients to ensure this service worker takes control
    // This handles both waiting and already-active service workers during hard refresh
    // - skipWaiting() forces activation if the service worker is in waiting state
    // - clients.claim() takes control of all clients immediately
    await self.skipWaiting();
    await self.clients.claim();
  }
});

// Handle fetch events
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  const matchedConfig = getMatchingConfig(url.toString());

  // only handle requests that match the config
  if (matchedConfig) {
    const requestHeaders = new Headers(event.request.headers);
    const handleRequest = async () => {
      // if the matched config has scopes, append the token to the request
      if (matchedConfig.scopes) {
        const token = await getToken(matchedConfig.scopes);
        requestHeaders.set('Authorization', `Bearer ${token}`);
      }

      // if the matched config has a rewrite, rewrite the url
      if (typeof matchedConfig.rewrite === 'string') {
        url.pathname = url.pathname.replace(matchedConfig?.url, matchedConfig.rewrite);
      }

      // fetch the request with the modified url and headers
      return fetch(url, { headers: requestHeaders });
    };
    event.respondWith(handleRequest());
  }
});
