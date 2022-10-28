export const jsonSelector = <TType = unknown, TResponse extends Response = Response>(
    response: TResponse
): Promise<TType> => {
    if (!response.ok) {
        throw new Error('Network response was not OK');
    }
    //Status code 204 is no content
    if (response.status === 204) {
        return Promise.resolve() as Promise<TType>;
    }

    return response.json();
};

export default jsonSelector;
