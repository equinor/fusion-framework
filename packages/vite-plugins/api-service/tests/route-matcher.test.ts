import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';
import { describe, expect, it } from 'vitest';

import { createRouteMatcher } from '../src/create-route-matcher.js';

describe('path-to-regexp v9 route matching', () => {
  const request = new IncomingMessage(new Socket());

  it('captures the last parameter greedily within a dotted segment', () => {
    const matcher = createRouteMatcher({
      match: '/:file.:ext',
      proxy: { target: 'http://localhost:3001' },
    });

    expect(matcher('/foo.json.html', request)).toMatchObject({
      params: { file: 'foo', ext: 'json.html' },
    });
  });

  it('keeps dotted values unambiguous when parameters use separate segments', () => {
    const matcher = createRouteMatcher({
      match: '/files/:file/extensions/:ext',
      proxy: { target: 'http://localhost:3001' },
    });

    expect(matcher('/files/foo.json/extensions/html', request)).toMatchObject({
      params: { file: 'foo.json', ext: 'html' },
    });
  });

  it('does not append another slash to an explicitly terminated pattern', () => {
    const matcher = createRouteMatcher({
      match: '/files/',
      proxy: { target: 'http://localhost:3001' },
    });

    expect(matcher('/files/', request)).toBeTruthy();
    expect(matcher('/files//', request)).toBe(false);
  });

  it('preserves optional trailing slashes for patterns without an explicit slash', () => {
    const matcher = createRouteMatcher({
      match: '/users/:id',
      proxy: { target: 'http://localhost:3001' },
    });

    expect(matcher('/users/42/', request)).toMatchObject({ params: { id: '42' } });
  });
});
