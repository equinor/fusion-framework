import type { AppConfig } from '@equinor/fusion-framework-module-app';

/**
 * Publishes app config to the apps-service endpoint
 * @param endpoint string The endpoint to upload to
 * @param appKey The application key
 * @param config Object with app config
 * @returns HTTP response as json
 */
export const publishAppConfig = async (endpoint: string, appKey: string, config: AppConfig) => {
    const requestConfig = await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(config),
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (requestConfig.status === 410) {
        throw new Error(
            `App ${appKey} is deleted from apps-service. HTTP status ${requestConfig.status}, ${requestConfig.statusText}`,
        );
    } else if (!requestConfig.ok || requestConfig.status > 399) {
        const response = await requestConfig.json();
        console.log(response);
        throw new Error(
            `Failed to upload config. HTTP status ${requestConfig.status}, ${requestConfig.statusText}`,
        );
    }

    return await requestConfig.json();
};
