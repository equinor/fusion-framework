/**
 * Send request to apps-service to tag a bundle.
 * @param endpoint string The endpoint to send request to.
 * @param version string The version to tag the bundle with.
 * @returns Response object as json.
 */
export const tagAppBundle = async (endpoint: string, version: string) => {
    const requestTag = await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ version }),
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (requestTag.status === 404) {
        throw new Error(
            `Failed to tag bundle, make sure version ${version} exist. HTTP status ${requestTag.status} - ${requestTag.statusText}`,
        );
    }

    if (requestTag.status !== 200) {
        throw new Error(
            `Failed to tag bundle. HTTP status ${requestTag.status}, ${requestTag.statusText}`,
        );
    }

    return await requestTag.json();
};
