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

  // Mock GET /persons/me/apps
  http.get(new URL('persons/me/apps', BASE_URL).toString(), (req) => {
    const url = new URL(req.request.url);
    // Reject requests that omit the API version required by the fixture
    if (!url.searchParams.get('api-version')) {
      return HttpResponse.error();
    }
    return HttpResponse.json([{ appKey: 'my-app', documentCount: 3, storageSize: 1024 }]);
  }),

  // Mock GET /persons/me/apps/:appKey
  http.get(new URL('persons/me/apps/:appKey', BASE_URL).toString(), (req) => {
    const { appKey } = req.params;
    const url = new URL(req.request.url);
    // Reject requests that omit the API version required by the fixture
    if (!url.searchParams.get('api-version')) {
      return HttpResponse.error();
    }
    return HttpResponse.json({ appKey, documentCount: 3, storageSize: 1024 });
  }),

  // Mock DELETE /persons/me/apps/:appKey
  http.delete(new URL('persons/me/apps/:appKey', BASE_URL).toString(), (req) => {
    const url = new URL(req.request.url);
    // Reject requests that omit the API version required by the fixture
    if (!url.searchParams.get('api-version')) {
      return HttpResponse.error();
    }
    return HttpResponse.json({ wiped: true });
  }),

  // Mock DELETE /persons/me
  http.delete(new URL('persons/me', BASE_URL).toString(), (req) => {
    const url = new URL(req.request.url);
    // Reject requests that omit the API version required by the fixture
    if (!url.searchParams.get('api-version')) {
      return HttpResponse.error();
    }
    // The GDPR erasure endpoint requires an explicit opt-in header
    if (req.request.headers.get('X-Confirm-Wipe') !== 'true') {
      return new HttpResponse(null, { status: 400 });
    }
    return HttpResponse.json({ wiped: true });
  }),

  // Mock GET /admin/apps/:appKey/users
  http.get(new URL('admin/apps/:appKey/users', BASE_URL).toString(), (req) => {
    const url = new URL(req.request.url);
    // Reject requests that omit the API version required by the fixture
    if (!url.searchParams.get('api-version')) {
      return HttpResponse.error();
    }
    return HttpResponse.json(['user-oid-1', 'user-oid-2']);
  }),

  // Mock GET /admin/apps/:appKey/users/:userId
  http.get(new URL('admin/apps/:appKey/users/:userId', BASE_URL).toString(), (req) => {
    const { userId } = req.params;
    const url = new URL(req.request.url);
    // Reject requests that omit the API version required by the fixture
    if (!url.searchParams.get('api-version')) {
      return HttpResponse.error();
    }
    return HttpResponse.json({ userId, documentCount: 1, storageSize: 128 });
  }),

  // Mock DELETE /admin/apps/:appKey/users/:userId
  http.delete(new URL('admin/apps/:appKey/users/:userId', BASE_URL).toString(), (req) => {
    const url = new URL(req.request.url);
    // Reject requests that omit the API version required by the fixture
    if (!url.searchParams.get('api-version')) {
      return HttpResponse.error();
    }
    return HttpResponse.json({ wiped: true });
  }),

  // Mock DELETE /admin/apps/:appKey
  http.delete(new URL('admin/apps/:appKey', BASE_URL).toString(), (req) => {
    const url = new URL(req.request.url);
    // Reject requests that omit the API version required by the fixture
    if (!url.searchParams.get('api-version')) {
      return HttpResponse.error();
    }
    // Wiping every user's state for an app requires an explicit opt-in header
    if (req.request.headers.get('X-Confirm-Wipe') !== 'true') {
      return new HttpResponse(null, { status: 400 });
    }
    return HttpResponse.json({ wiped: true });
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
