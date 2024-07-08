import type { ResponseSelector, BlobResult } from '../client/types';

/**
 * Extracts a blob and filename from a successful HTTP response.
 *
 * @param response - The HTTP response to extract the blob and filename from.
 * @returns A promise that resolves to an object containing the extracted blob and filename.
 * @throws {Error} If the response is not successful or if there is an error parsing the response.
 */
export const blobSelector: ResponseSelector = async <TResponse extends Response = Response>(
    response: TResponse,
): Promise<BlobResult> => {
    if (!response.ok) {
        // Throw an error if the network response is not successful
        throw new Error('network response was not OK');
    }

    // Status code 204 indicates no content, so throw an error
    if (response.status === 204) {
        throw new Error('no content');
    }

    // Extract the filename from the 'content-disposition' header
    const filename = response.headers
        .get('content-disposition')
        ?.split(';')
        .find((n) => n.includes('filename='))
        ?.replace('filename=', '')
        ?.trim();

    try {
        // Convert the response to a Blob and return the filename and Blob
        const blob = await response.blob();
        return { filename, blob };
    } catch (err) {
        // Throw an error if there's a problem parsing the response
        throw Error('failed to parse response');
    }
};

export default blobSelector;
