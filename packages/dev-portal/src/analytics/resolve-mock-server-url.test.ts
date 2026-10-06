import { afterEach, describe, expect, it } from 'vitest';

import { resolveMockServerUrl } from './resolve-mock-server-url';

describe('resolveMockServerUrl', () => {
  afterEach(() => {
    delete window.FUSION_MOCK_SERVER_URL;
  });

  it.each([
    ['http://localhost:4010', 'http://localhost:4010'],
    ['http://localhost:4010/', 'http://localhost:4010'],
    ['https://mock.example.test/path', 'https://mock.example.test'],
    ['%FUSION_SPA_MSAL_MOCK_SERVER_URL%', undefined],
    ['', undefined],
    ['javascript:alert(1)', undefined],
    [undefined, undefined],
  ])('resolves %j to %j', (value, expected) => {
    expect(resolveMockServerUrl(value)).toBe(expected);
  });

  it('reads the value the dev server HTML sets on window by default', () => {
    window.FUSION_MOCK_SERVER_URL = 'http://localhost:4010';

    expect(resolveMockServerUrl()).toBe('http://localhost:4010');
  });
});
