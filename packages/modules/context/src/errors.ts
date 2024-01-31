export class FusionContextSearchError extends Error {
    #details;

    get title(): string {
        return this.#details.title;
    }

    get description(): string | undefined {
        return this.#details.description;
    }

    constructor(
        details: {
            title: string;
            description?: string;
        },
        options?: ErrorOptions,
    ) {
        super(details.description ?? details.title, options);
        this.#details = details;
        this.name = 'FusionContextSearchError';
    }
}
