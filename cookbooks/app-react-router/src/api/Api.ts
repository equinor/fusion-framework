import type { QueryClient } from '@tanstack/react-query';
import { PeopleApi } from './PeopleApi';
import { ProductApi } from './ProductApi';
import { UserApi } from './UserApi';

/**
 * HTTP provider interface for creating HTTP clients
 */
interface IHttpProvider {
  createClient(key: string): {
    json<T>(url: string, options?: { headers?: Record<string, string> }): Promise<T>;
  } | Promise<{
    json<T>(url: string, options?: { headers?: Record<string, string> }): Promise<T>;
  }>;
}

/**
 * Unified API class for People, Products, and Users operations
 * Uses React Query for caching and request deduplication
 */
export class Api {
  readonly product: ProductApi;
  readonly people: PeopleApi;
  readonly user: UserApi;

  constructor(queryClient: QueryClient, httpProvider: IHttpProvider) {
    this.product = new ProductApi(queryClient, httpProvider);
    this.people = new PeopleApi(queryClient, httpProvider);
    this.user = new UserApi(queryClient, httpProvider);
  }
}

