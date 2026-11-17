import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { KeyCredential } from '@azure/core-auth';
import type { SearchClientOptions } from '@azure/search-documents';

const { baseSearchClientConstructor } = vi.hoisted(() => ({
  baseSearchClientConstructor: vi.fn(),
}));

vi.mock('@azure/search-documents', () => ({
  SearchClient: class {
    constructor(...args: unknown[]) {
      baseSearchClientConstructor(...args);
    }
  },
}));

import { FusionSearchClient } from './FusionSearchClient.js';

const credential: KeyCredential = { key: 'test-key' };

const getPassedOptions = (): SearchClientOptions =>
  baseSearchClientConstructor.mock.calls[0]?.[3] as SearchClientOptions;

beforeEach(() => {
  baseSearchClientConstructor.mockClear();
});

describe('FusionSearchClient service version', () => {
  it('keeps the proxy service version when no version is provided', () => {
    new FusionSearchClient('https://search.test', 'index', credential);

    expect(getPassedOptions().serviceVersion).toBe('2026-04-01');
  });

  it('preserves an explicit serviceVersion', () => {
    new FusionSearchClient('https://search.test', 'index', credential, {
      serviceVersion: '2025-05-01',
    });

    expect(getPassedOptions().serviceVersion).toBe('2025-05-01');
  });

  it('uses an explicit apiVersion when serviceVersion is not provided', () => {
    const options = { apiVersion: '2025-03-01' } as SearchClientOptions & {
      apiVersion: string;
    };
    new FusionSearchClient('https://search.test', 'index', credential, options);

    expect(getPassedOptions().serviceVersion).toBe('2025-03-01');
  });
});
