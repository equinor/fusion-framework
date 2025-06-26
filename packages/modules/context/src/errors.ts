/**
 * Represents an error that occurs during a Fusion context search operation.
 *
 * This error provides a title and an optional description to give more context
 * about the failure. It extends the built-in `Error` class and sets the error
 * name to `'FusionContextSearchError'`.
 *
 * @example
 * ```typescript
 * throw new FusionContextSearchError({ title: 'Search failed', description: 'No results found.' });
 * ```
 *
 * @public
 */
export class FusionContextSearchError extends Error {
  #details;

  /**
   * The title of the error.
   */
  get title(): string {
    return this.#details.title;
  }

  /**
   * The description of the error, if available.
   */
  get description(): string | undefined {
    return this.#details.description;
  }

  /**
   * Creates a new instance of FusionContextSearchError.
   * @param details - The details of the error.
   * @param options - Optional parameters for the error.
   */
  constructor(
    details: {
      /**
       * The title of the error.
       */
      title: string;
      /**
       * The description of the error, if available.
       */
      description?: string;
    },
    options?: ErrorOptions,
  ) {
    super(details.description ?? details.title, options);
    this.#details = details;
    this.name = 'FusionContextSearchError';
  }
}
