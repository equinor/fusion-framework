import type { QueryClient } from '@tanstack/react-query';

/**
 * Product type definition
 */
export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  inStock: boolean;
  reviews: number;
  rating: number;
  image: string;
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
 * Filter options for product queries
 */
export interface GetProductsOptions {
  /** Filter by category name */
  filter?: string | null;
  /** Sort order: price-asc, price-desc, name-asc, name-desc */
  sort?: string;
  /** Filter to show only in-stock products */
  inStock?: boolean;
}

/**
 * Result of filtering and sorting products
 */
export interface GetProductsResult {
  /** Filtered and sorted products */
  products: Product[];
  /** Total number of products before filtering */
  productCount: number;
}

/**
 * API class for Product-related operations
 * Uses React Query for caching and request deduplication
 */
export class ProductApi {
  #queryClient: QueryClient;
  #httpProvider: IHttpProvider;

  /**
   * Get the products HTTP client
   * Handles both sync and async createClient methods
   */
  async getProductsHttpClient() {
    const client = this.#httpProvider.createClient('products');
    return client instanceof Promise ? await client : client;
  }

  /**
   * Creates a product API backed by shared query caching and HTTP access.
   * @param queryClient - Query client used for request caching.
   * @param httpProvider - Provider used to create the products HTTP client.
   */
  constructor(queryClient: QueryClient, httpProvider: IHttpProvider) {
    this.#queryClient = queryClient;
    this.#httpProvider = httpProvider;
  }

  /**
   * Get products with optional filtering and sorting
   * @param options - Filter and sort options
   * @returns Promise resolving to filtered and sorted products with counts
   */
  async getProducts(options: GetProductsOptions = {}): Promise<GetProductsResult> {
    const { filter, sort = 'name-asc', inStock } = options;

    // Fetch all products (cached)
    const allProducts = await this.#queryClient.fetchQuery<Product[]>({
      queryKey: ['products', 'list'],
      queryFn: async () => {
        const client = await this.getProductsHttpClient();
        const data = await client.json<{ products: Product[] }>('@fusion-api/api/products');
        return data.products;
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    let filtered = [...allProducts];

    // Narrow the cached catalog only when a category filter is selected.
    if (filter) {
      filtered = filtered
        // Keep only products matching the selected category.
        .filter((p) => p.category === filter);
    }

    // Apply the stock constraint only when the caller requests available products.
    if (inStock) {
      filtered = filtered
        // Keep only products currently available for purchase.
        .filter((p) => p.inStock);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // Map each supported sort option to its corresponding product comparison.
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return {
      products: filtered,
      productCount: allProducts.length,
    };
  }

  /**
   * Get a product by ID
   * @param productId - The product ID
   * @returns Promise resolving to a product
   */
  async getProduct(productId: number): Promise<Product> {
    return this.#queryClient.fetchQuery<Product>({
      queryKey: ['products', 'product', productId],
      queryFn: async () => {
        const client = await this.getProductsHttpClient();
        return client.json<Product>(`@fusion-api/api/products/${productId}`);
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  }

  /**
   * Get all product categories
   * @returns Promise resolving to an array of category strings
   */
  async getCategories(): Promise<string[]> {
    return this.#queryClient.fetchQuery<string[]>({
      queryKey: ['products', 'categories'],
      queryFn: async () => {
        const client = await this.getProductsHttpClient();
        const data = await client.json<{ categories: string[] }>('@fusion-api/api/categories');
        return data.categories;
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  }

  /**
   * Invalidate products list cache
   */
  invalidateProducts(): void {
    this.#queryClient.invalidateQueries({
      queryKey: ['products', 'list'],
    });
  }

  /**
   * Invalidate product cache
   * @param productId - Optional product ID to invalidate specific cache entry
   */
  invalidateProduct(productId?: number): void {
    // Target one product when an ID is supplied; otherwise clear all product details.
    if (productId) {
      this.#queryClient.invalidateQueries({
        queryKey: ['products', 'product', productId],
      });
    } else {
      this.#queryClient.invalidateQueries({
        queryKey: ['products', 'product'],
      });
    }
  }
}
