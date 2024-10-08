import fetch from 'node-fetch';

/**
 * Make sure the app is registerred in the app-service
 * @param endpoint <string> The endpoint to make a call to
 */
export const isAppRegistered = async (endpoint: string): Promise<boolean> => {
    const requestApp = await fetch(endpoint, {
        method: 'HEAD',
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
        },
    });

    /** Assume that ok response asserts that app exists */
    if (requestApp.ok) {
        return true;
    }

    if (requestApp.status === 404 || requestApp.status === 410) {
        return false;
    }

    const data = await requestApp.json();
    throw Error('Custom Fusion error, see cause.', { cause: data });
};
