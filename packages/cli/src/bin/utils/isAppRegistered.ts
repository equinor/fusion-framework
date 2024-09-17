/**
 * Make sure the app is registerred in the app-service
 * @param endpoint <string> The endpoint to make a call to
 * @param appKey <string> The appkey to check for
 * @returns response object as json
 */
export const isAppRegistered = async (endpoint: string, appKey: string) => {
    const requestApp = await fetch(endpoint, {
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
        },
    });

    if (requestApp.status === 404) {
        throw new Error(
            `The appkey '${appKey}' is not registered, visit the app-admin app and register the application there.`,
        );
    }

    if (!requestApp.ok) {
        throw new Error(
            `Could not connect to apps-service. HTTP status ${requestApp.status}, ${requestApp.statusText}`,
        );
    }

    return await requestApp.json();
};
