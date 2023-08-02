export const noop = () => {
    return;
};

export const defer = <TType = void>(cb?: () => TType, timeout = 0) =>
    new Promise<TType>((resolve, reject) =>
        setTimeout(() => {
            try {
                const res = cb ? cb() : noop();
                return resolve(res as unknown as TType);
            } catch (err) {
                reject(err);
            }
        }, timeout),
    );

export const sleep = (timeout?: number) => defer(noop, timeout);

export const emulateRequest =
    <T = unknown>(timeout = 20) =>
    (args: T): Promise<T> =>
        defer(() => args, timeout);

export const emulateRetry =
    <T>(retries: number, timeout?: number) =>
    async (args: T): Promise<T> => {
        return defer(() => {
            if (retries > 0) {
                retries--;
                throw Error('try again');
            }
            return args;
        }, timeout);
    };
