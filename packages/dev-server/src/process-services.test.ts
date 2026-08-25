import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';

import { describe, expect, it } from 'vitest';

import { processServices } from './process-services.js';

const request = new IncomingMessage(new Socket());
request.headers.referer = 'http://localhost:3000';

describe('processServices', () => {
  it('proxies localhost subdomains through the portable shared-host route', () => {
    const result = processServices(
      [{ key: 'people', name: 'People', uri: 'http://people.localhost:4010' }],
      { route: '/@fusion-api', request },
    );

    expect(result.routes).toEqual([
      {
        match: '/people/*sub',
        proxy: { target: 'http://localhost:4010' },
      },
    ]);
  });

  it('preserves normal upstream proxy targets and path rewriting', () => {
    const result = processServices(
      [{ key: 'people', name: 'People', uri: 'https://people.example/api' }],
      { route: '/@fusion-api', request },
    );
    const [route] = result.routes ?? [];

    expect(route?.proxy?.target).toBe('https://people.example');
    expect(route?.proxy?.rewrite?.('/people/api/persons')).toBe('/api/persons');
  });
});
