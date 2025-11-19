import type { QueryClient } from '@tanstack/react-query';

/**
 * User type definition
 */
export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  location: string;
  joinDate: string;
};

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
 * Options for getting users with pagination
 */
export interface GetUsersOptions {
  /** Page number (1-based) */
  page?: number;
  /** Number of users per page */
  limit?: number;
}

/**
 * Result of getting users with pagination
 */
export interface GetUsersResult {
  /** Array of users for the current page */
  users: User[];
  /** Current page number */
  page: number;
  /** Number of users per page */
  limit: number;
  /** Total number of users */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * API class for User-related operations
 * Uses React Query for caching and request deduplication
 */
export class UserApi {
  #queryClient: QueryClient;
  #httpProvider: IHttpProvider;

  /**
   * Get the users HTTP client
   * Handles both sync and async createClient methods
   */
  async getUsersHttpClient() {
    const client = this.#httpProvider.createClient('users');
    return client instanceof Promise ? await client : client;
  }

  constructor(queryClient: QueryClient, httpProvider: IHttpProvider) {
    this.#queryClient = queryClient;
    this.#httpProvider = httpProvider;
  }

  /**
   * Get users with optional pagination
   * @param options - Pagination options
   * @returns Promise resolving to paginated users with metadata
   */
  async getUsers(options: GetUsersOptions = {}): Promise<GetUsersResult> {
    const { page = 1, limit = 5 } = options;

    return this.#queryClient.fetchQuery<GetUsersResult>({
      queryKey: ['users', 'list', page, limit],
      queryFn: async () => {
        const client = await this.getUsersHttpClient();
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        if (limit !== 5) params.set('limit', limit.toString());
        const queryString = params.toString();
        const url = queryString ? `@fusion-api/api/users?${queryString}` : '@fusion-api/api/users';
        return client.json<GetUsersResult>(url);
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  }

  /**
   * Get a user by ID
   * @param userId - The user ID
   * @returns Promise resolving to a user
   */
  async getUser(userId: number): Promise<User> {
    return this.#queryClient.fetchQuery<User>({
      queryKey: ['users', 'user', userId],
      queryFn: async () => {
        const client = await this.getUsersHttpClient();
        return client.json<User>(`@fusion-api/api/users/${userId}`);
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  }

  /**
   * Invalidate users list cache
   */
  invalidateUsers(): void {
    this.#queryClient.invalidateQueries({
      queryKey: ['users', 'list'],
    });
  }

  /**
   * Invalidate user cache
   * @param userId - Optional user ID to invalidate specific cache entry
   */
  invalidateUser(userId?: number): void {
    if (userId) {
      this.#queryClient.invalidateQueries({
        queryKey: ['users', 'user', userId],
      });
    } else {
      this.#queryClient.invalidateQueries({
        queryKey: ['users', 'user'],
      });
    }
  }
}
