export class UnsupportedApiVersion extends Error {
    constructor(
        public readonly version: string | number,
        cause?: unknown,
    ) {
        super(`unsupported version ${version}`, { cause });
    }
}
