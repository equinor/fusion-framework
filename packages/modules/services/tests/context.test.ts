import { describe, expect, it, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

import { BASE_URL } from './setup';

import { ContextApiClient, ApiVersion } from '../src/context';

import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import { UnsupportedApiVersion } from '../src/errors';

import { mockContextItem } from './mocks';

describe('Context', () => {
  let httpClient: HttpClient;
  let httpClientWatcher: MockInstance;
  let contextClient: ContextApiClient;

  beforeEach(() => {
    httpClient = new HttpClient(BASE_URL, {
      /* options */
    });
    httpClientWatcher = vi.spyOn(httpClient, 'json');
    contextClient = new ContextApiClient(httpClient, 'json');
  });

  afterEach(() => {
    httpClientWatcher.mockRestore();
  });

  describe('get', () => {
    it('should generate parameters for valid API version and arguments for V1', async () => {
      const contextId = '123e4567-e89b-12d3-a456-426614174000';
      const expected = mockContextItem(contextId);
      const result = await contextClient.get('v1', { id: contextId });

      expect(result).toMatchObject(expected);

      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/contexts/${contextId}/?api-version=${ApiVersion.v1}`,
        undefined,
      );
    });

    it('should throw UnsupportedApiVersion for unsupported API version', async () => {
      // Attempt to get context with an unsupported API version 'v2'
      // This should throw an UnsupportedApiVersion error because 'v2' is not a valid API version
      try {
        await contextClient.get('v2', { id: '123e4567-e89b-12d3-a456-426614174000' });
        expect(true).toBe(false); // This line should not be reached
      } catch (error) {
        // Verify that the error is of type UnsupportedApiVersion
        expect(error).toBeInstanceOf(UnsupportedApiVersion);
      }
    });
  });

  describe('query', () => {
    it('should generate parameters for valid API version and arguments for V1', async () => {
      const result = await contextClient.query('v1', { query: { filter: { type: ['master'] } } });

      expect(result).toHaveLength(10);

      const searchParams = new URLSearchParams();
      searchParams.append('$filter', "type in ('master')");
      searchParams.append('api-version', ApiVersion.v1);

      expect(httpClientWatcher).toHaveBeenCalledWith(`/contexts/?${searchParams}`, undefined);
    });

    it('should throw UnsupportedApiVersion for unsupported API version', async () => {
      // Attempt to get context with an unsupported API version 'v2'
      // This should throw an UnsupportedApiVersion error because 'v2' is not a valid API version
      try {
        await contextClient.query('v2', { query: { filter: { type: ['master'] } } });
        expect(true).toBe(false); // This line should not be reached
      } catch (error) {
        // Verify that the error is of type UnsupportedApiVersion
        expect(error).toBeInstanceOf(UnsupportedApiVersion);
      }
    });
  });

  describe('related', () => {
    it('should generate parameters for valid API version and arguments for V1', async () => {
      const contextId = '123e4567-e89b-12d3-a456-426614174000';

      await contextClient.related('v1', { id: contextId, query: { filter: { type: ['master'] } } });

      const searchParams = new URLSearchParams();
      searchParams.append('$filter', "type in ('master')");
      searchParams.append('api-version', ApiVersion.v1);

      expect(httpClientWatcher).toHaveBeenCalledWith(
        `/contexts/${contextId}/relations?${searchParams}`,
        undefined,
      );
    });
    it('should throw UnsupportedApiVersion for unsupported API version', async () => {
      // Attempt to get context with an unsupported API version 'v2'
      // This should throw an UnsupportedApiVersion error because 'v2' is not a valid API version
      try {
        await contextClient.related('v2', { id: '123e4567-e89b-12d3-a456-426614174000' });
        expect(true).toBe(false); // This line should not be reached
      } catch (error) {
        // Verify that the error is of type UnsupportedApiVersion
        expect(error).toBeInstanceOf(UnsupportedApiVersion);
      }
    });
  });
});
