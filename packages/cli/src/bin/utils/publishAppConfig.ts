import type { ApiAppConfig } from '../../schemas.js';

/**
 * Publishes app config to the apps-service endpoint
 * @param endpoint string The endpoint to upload to
 * @param appKey The application key
 * @param config Object with app config
 * @returns HTTP response as json
 */
export const publishAppConfig = async (endpoint: string, appKey: string, config: ApiAppConfig) => {
  const requestConfig = await fetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(config),
    headers: {
      Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  // if the status is 410, the app is deleted from apps-service
  if (requestConfig.status === 410) {
    throw new Error(
      `App ${appKey} is deleted from apps-service. HTTP status ${requestConfig.status}, ${requestConfig.statusText}`,
    );
  }
  
  // if the request is not ok or the status is 400 or higher, throw an error
  if (!requestConfig.ok || requestConfig.status >= 400) {
    const response = await requestConfig.json();
    console.error(response);
    throw new Error(
      `Failed to upload config. HTTP status ${requestConfig.status}, ${requestConfig.statusText}`,
    );
  }

  return requestConfig.json();
};
