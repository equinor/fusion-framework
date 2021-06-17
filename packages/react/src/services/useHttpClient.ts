import { HttpClient, FusionClient } from '@equinor/fusion-framework/services';
import { useMemo } from 'react';
import { useServices } from './ServiceProvider';

type FusionHttpClients = 'portal' | 'dataproxy';

export interface CustomHttpClients {}

/**
 * Use a predefined fusion client
 */
export function useHttpClient<
    T extends HttpClient = FusionClient,
    K extends FusionHttpClients = never
>(key: K): T;

/**
 * Use a custom defined client
 */
export function useHttpClient<
    T extends HttpClient = FusionClient,
    K extends keyof CustomHttpClients = never
>(key: K): K extends keyof CustomHttpClients ? CustomHttpClients[K] : T;

/**
 * Creates an undefined client
 * @example
 * ```ts
 * class MyClient extends HttpClient {}
 * declare module '@equinor/fusion-react' {
 *   export interface CustomHttpClients {
 *     foo: HttpClient,
 *     bar: MyClient;
 *   }
 * }
 * ```
 */
export function useHttpClient<T extends HttpClient = FusionClient, K extends string = never>(
    key: K
): T;

export function useHttpClient<
    T extends HttpClient = FusionClient,
    K extends keyof CustomHttpClients | FusionHttpClients = never
>(key: Extract<K, string>): K extends keyof CustomHttpClients ? CustomHttpClients[K] : T {
    const { http } = useServices();
    return useMemo(() => http.createClient(key), [http, key]);
}
