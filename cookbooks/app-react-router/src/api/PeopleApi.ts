import type { QueryClient } from '@tanstack/react-query';
import type { PersonSearchResult, PersonDetails } from './types';

/**
 * HTTP provider interface for creating HTTP clients
 */
interface IHttpProvider {
  createClient(key: string):
    | {
        json<T>(url: string, options?: { headers?: Record<string, string> }): Promise<T>;
      }
    | Promise<{
        json<T>(url: string, options?: { headers?: Record<string, string> }): Promise<T>;
      }>;
}

/**
 * API class for People-related operations
 * Uses React Query for caching and request deduplication
 */
export class PeopleApi {
  #queryClient: QueryClient;
  #httpProvider: IHttpProvider;

  /**
   * Get the people HTTP client
   * Handles both sync and async createClient methods
   */
  async getPeopleHttpClient() {
    const client = this.#httpProvider.createClient('people');
    return client instanceof Promise ? await client : client;
  }

  constructor(queryClient: QueryClient, httpProvider: IHttpProvider) {
    this.#queryClient = queryClient;
    this.#httpProvider = httpProvider;
  }

  /**
   * Search for people by name, email, or other identifiers
   * @param searchTerm - The search term to query
   * @returns Promise resolving to an array of person search results
   */
  async searchPeople(searchTerm: string): Promise<PersonSearchResult[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    return this.#queryClient.fetchQuery<PersonSearchResult[]>({
      queryKey: ['people', 'search', searchTerm],
      queryFn: async () => {
        const client = await this.getPeopleHttpClient();
        return client.json<PersonSearchResult[]>(
          `/persons?$search=${encodeURIComponent(searchTerm)}`,
          {
            headers: {
              'api-version': '2',
            },
          },
        );
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  }

  /**
   * Get person details by user ID or email
   * @param userId - User ID or email address (e.g., 'me', 'handah@equinor.com')
   * @returns Promise resolving to person details
   */
  async getPerson(userId: string): Promise<PersonDetails> {
    return this.#queryClient.fetchQuery<PersonDetails>({
      queryKey: ['people', 'person', userId],
      queryFn: async () => {
        const client = await this.getPeopleHttpClient();
        return client.json<PersonDetails>(`/persons/${userId}?api-version=4.0`);
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  }

  /**
   * Invalidate people search cache
   * @param searchTerm - Optional search term to invalidate specific cache entry
   */
  invalidateSearch(searchTerm?: string): void {
    if (searchTerm) {
      this.#queryClient.invalidateQueries({
        queryKey: ['people', 'search', searchTerm],
      });
    } else {
      this.#queryClient.invalidateQueries({
        queryKey: ['people', 'search'],
      });
    }
  }

  /**
   * Invalidate person details cache
   * @param userId - Optional user ID to invalidate specific cache entry
   */
  invalidatePerson(userId?: string): void {
    if (userId) {
      this.#queryClient.invalidateQueries({
        queryKey: ['people', 'person', userId],
      });
    } else {
      this.#queryClient.invalidateQueries({
        queryKey: ['people', 'person'],
      });
    }
  }
}
