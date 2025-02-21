/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, it, expect, vi } from 'vitest';
import {
  capitalizeRequestMethodOperator,
  type ProcessOperator,
  requestValidationOperator,
} from '../src/lib/operators';
import type { FetchRequest } from '../src/lib';

const executeOperator = <R, O extends ProcessOperator<FetchRequest, R>>(
  operator: O,
  request: Parameters<O>[0],
): Promise<ReturnType<O>> => {
  return new Promise((resolve, rejects) => {
    try {
      resolve(operator(request) as ReturnType<O>);
    } catch (error) {
      rejects(error);
    }
  });
};

describe('capitalizeRequestMethodOperator', () => {
  it('should capitalize request method', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementationOnce((msg) => {
      expect(msg).toMatch(/RFC 7231/);
    });

    const operator = capitalizeRequestMethodOperator();

    const result = executeOperator(operator, { method: 'get' });

    expect(result).resolves.toMatchObject({ method: 'GET' });
    expect(consoleWarn).toHaveBeenCalled();
  });
});

describe('requestValidationOperator', () => {
  /**
   * A mock FetchRequest object used for testing purposes.
   */
  const mockRequest: FetchRequest = Object.freeze({
    method: 'GET',
    uri: 'https://foo.bar',
    path: 'api',
  });

  it('should pass validation for valid request parameters', async () => {
    const operator = requestValidationOperator();

    const result = executeOperator(operator, mockRequest);

    expect(result).resolves.toBeUndefined();
  });

  it('should parse valid request parameters', async () => {
    const operator = requestValidationOperator({ parse: true });

    const result = executeOperator(operator, mockRequest);

    expect(result).resolves.toStrictEqual(mockRequest);
  });

  it('should allow additional properties when strict validation is disabled', async () => {
    const operator = requestValidationOperator({ parse: true });

    const result = executeOperator(operator, {
      ...mockRequest,
      // @ts-expect-error
      additionalProperty: 'some-value',
    });

    expect(result).resolves.toMatchObject(mockRequest);
    expect(result).resolves.toHaveProperty('additionalProperty', 'some-value');
  });

  it('should remove additional properties when strict validation is enabled', async () => {
    const operator = requestValidationOperator({ parse: true, strict: true });

    const result = executeOperator(operator, {
      ...mockRequest,
      // @ts-expect-error
      additionalProperty: 'some-value',
      method: 'GET',
    });

    expect(result).resolves.toStrictEqual(mockRequest);
    expect(result).resolves.not.toHaveProperty('additionalProperty');
  });

  it('should throw an error for invalid request parameters', async () => {
    const operator = requestValidationOperator({ parse: true });

    const result = executeOperator(operator, {
      ...mockRequest,
      method: 'GETS', // invalid method
    });

    expect(result).rejects.toThrowError('RFC 2615');
  });
});
