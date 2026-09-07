import { afterEach, describe, expect, it, vi } from 'vitest';

import { actions } from '../app/actions';
import type { AppManifest } from '../types';

const manifest: AppManifest = {
  appKey: 'test-app',
  displayName: 'Test App',
  description: 'A test application',
  type: 'standalone',
};

describe('actions.setManifest', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('records the creation time for an initial manifest action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    expect(actions.setManifest(manifest).meta).toEqual({ created: 1_000, update: undefined });
  });

  it('records a new creation time for a manifest update action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const initialAction = actions.setManifest(manifest);
    vi.setSystemTime(2_000);

    expect(actions.setManifest(manifest, true).meta).toEqual({ created: 2_000, update: true });
    expect(initialAction.meta.created).toBe(1_000);
  });
});
