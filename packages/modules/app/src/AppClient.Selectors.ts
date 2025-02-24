import {
  jsonSelector,
  type ResponseSelector,
} from '@equinor/fusion-framework-module-http/selectors';

import { AppConfig } from './AppConfig';
import { ApiAppConfigSchema } from './schemas';

/**
 * Asynchronously selects and parses the application configuration from the given response.
 *
 * @param response - The response object to select and parse the application configuration from.
 * @returns A promise that resolves to an instance of `AppConfig` containing the parsed configuration data.
 *
 * @throws Will throw an error if the response cannot be parsed or does not conform to the expected schema.
 */
export const AppConfigSelector: ResponseSelector<AppConfig> = async (response) => {
  // Select the JSON data from the response
  const raw = await jsonSelector(response);

  // Parse the JSON data using the API application configuration schema
  const data = ApiAppConfigSchema.parse(raw);

  return new AppConfig(data);
};
