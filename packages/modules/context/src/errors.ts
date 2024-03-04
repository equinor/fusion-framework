/**
 * Represents an error that occurs during a search in the Fusion Context.
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
