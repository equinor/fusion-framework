export class HttpResponseError extends Error {
    constructor(
        public message: string,
        public response: Response,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}
