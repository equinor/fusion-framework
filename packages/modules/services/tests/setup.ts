import { afterAll, afterEach, beforeAll } from 'vitest';

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import { mockContextItem } from './mocks';

import type { ApiVersion } from '../src/context';

export const BASE_URL = 'https://localhost';

// Define mock handlers for fetch requests
const handlers = [
  // Mock GET /contexts
  http.get(new URL('contexts', BASE_URL).toString(), (req) => {
    const url = new URL(req.request.url);
    const apiVersion = url.searchParams.get('api-version');
    // Reject requests that omit the API version required by the fixture
    if (!apiVersion) {
      return HttpResponse.error();
    }
    return HttpResponse.json(
      new Array(10)
        .fill(null)
        // Fabricate a page of context items for the requested API version
        .map((_, index) => mockContextItem(`context-item-${index}`, apiVersion as ApiVersion.v1)),
    );
  }),

  // Mock GET /contexts/:id
  http.get(new URL('contexts/:id', BASE_URL).toString(), (req) => {
    const { id } = req.params;
    // Reject malformed or missing path params rather than mocking an arbitrary item
    if (!id || typeof id !== 'string') {
      return HttpResponse.error();
    }
    const url = new URL(req.request.url);
    const apiVersion = url.searchParams.get('api-version');
    // Reject requests that omit the API version required by the fixture
    if (!apiVersion) {
      return HttpResponse.error();
    }
    return HttpResponse.json(mockContextItem(id, apiVersion as ApiVersion.v1));
  }),

  // Mock GET /contexts/:id/relations
  http.get(new URL('contexts/:id/relations', BASE_URL).toString(), (req) => {
    const { id } = req.params;
    // Reject malformed or missing path params rather than mocking arbitrary relations
    if (!id || typeof id !== 'string') {
      return HttpResponse.error();
    }
    const url = new URL(req.request.url);
    const apiVersion = url.searchParams.get('api-version');
    // Reject requests that omit the API version required by the fixture
    if (!apiVersion) {
      return HttpResponse.error();
    }
    return HttpResponse.json(
      new Array(3)
        .fill(null)
        // Fabricate a small page of related context items for the requested API version
        .map((_, index) =>
          mockContextItem(`context--related-item-${index}`, apiVersion as ApiVersion.v1),
        ),
    );
  }),
];

// Initialize the server
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Stop server after all tests
afterAll(() => server.close());
