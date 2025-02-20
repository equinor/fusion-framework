import { z } from 'zod';
import type { ProcessOperator } from './types';
import type { FetchRequest } from '../client/types';
import { fetchRequestSchema } from './fetch-request.schema';

/**
 * Validates the given request using the `requestInitSchema`.
 *
 * By default, the validation is not strict, meaning that additional properties
 * not defined in the schema will be allowed and passed through without causing validation errors.
 * Also the operator will not modify the request object, it will only log an error message if the validation fails.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 *
 * @param request - The request object to be validated.
 * @returns The validated request object if validation is successful.
 * @throws Will log an error message if the request validation fails.
 */
export const requestValidationOperator =
  <T extends FetchRequest>(options?: {
    /**
     * When enabled, the function will return the parsed result.
     * This means that if the request object passes validation,
     * the parsed and potentially transformed request object will be returned.
     * If this option is not enabled, the function will not return anything
     * even if the request object is valid.
     */
    parse?: boolean;
    /**
     * When set to true, the validation will be strict, meaning that any additional properties
     * not defined in the schema will cause the validation to fail. If set to false or omitted,
     * additional properties will be allowed and passed through without causing validation errors.
     *
     * @note this option is only applicable when the `parse` option is enabled.
     */
    strict?: boolean;
  }): ProcessOperator<T> =>
  (request) => {
    const { strict, parse } = options ?? {};
    const schema = strict ? fetchRequestSchema : fetchRequestSchema.passthrough();
    try {
      const result = schema.parse(request) as T;
      return parse ? result : void 0;
    } catch (error) {
      if (parse) {
        throw error;
      }
      console.error('Invalid request options', (error as z.ZodError).message);
    }
  };
