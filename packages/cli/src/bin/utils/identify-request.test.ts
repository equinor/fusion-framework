import { describe, expect, it } from 'vitest';

import { defaultHeaders } from './default-headers.js';
import { identifyRequest } from './identify-request.js';

describe('identifyRequest', () => {
  it('adds the CLI identification headers to a request without headers', () => {
    const request = identifyRequest({ uri: '/services' });
    const headers = new Headers(request.headers);

    expect(headers.get('X-Fusion-CLI-Name')).toBe(defaultHeaders['X-Fusion-CLI-Name']);
    expect(headers.get('X-Fusion-CLI-Version')).toBe(defaultHeaders['X-Fusion-CLI-Version']);
    expect(headers.get('User-Agent')).toBe(defaultHeaders['User-Agent']);
  });

  it('keeps unrelated headers and the rest of the request intact', () => {
    const request = identifyRequest({ uri: '/services', headers: { Accept: 'text/plain' } });

    expect(request.uri).toBe('/services');
    expect(new Headers(request.headers).get('Accept')).toBe('text/plain');
  });

  it('does not overwrite identification headers set by the caller, in any casing', () => {
    const request = identifyRequest({ headers: { 'x-fusion-cli-name': 'custom-tool' } });
    const headers = new Headers(request.headers);

    expect(headers.get('X-Fusion-CLI-Name')).toBe('custom-tool');
    expect(headers.get('X-Fusion-CLI-Version')).toBe(defaultHeaders['X-Fusion-CLI-Version']);
  });

  it('does not mutate the original request', () => {
    const original = { headers: new Headers({ Accept: 'text/plain' }) };
    identifyRequest(original);

    expect(original.headers.has('X-Fusion-CLI-Name')).toBe(false);
  });
});
