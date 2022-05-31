export const jsonSelector = <TType = unknown, TResponse extends Response = Response>(
    response: TResponse
): Promise<TType> => {
    if (!response.ok) {
        throw new Error('Network response was not OK');
    }
    try {
        return response.json();
    } catch (err) {
        throw Error('failed to parse response', { cause: err as Error });
    }
};
