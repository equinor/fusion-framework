export const blobSelector = <TResponse extends Response = Response>(
    response: TResponse,
): Promise<Blob> => {
    if (!response.ok) {
        throw new Error('network response was not OK');
    }
    //Status code 204 is no content
    if (response.status === 204) {
        throw new Error('no content');
    }

    try {
        return response.blob();
    } catch (err) {
        throw Error('failed to parse response');
    }
};

export default blobSelector;
