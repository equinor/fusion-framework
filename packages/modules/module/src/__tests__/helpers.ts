import { vi } from 'vitest';
import type { AnyModule } from '../types.js';

/**
 * Minimal provider shape returned by mock module initialize calls.
 * Includes `version` to satisfy the version-check in the initialize phase
 * and avoid spurious warning events during tests.
 */
export interface MockProvider {
  name: string;
  version: string;
  config: unknown;
}

/**
 * Creates a minimal mock module that satisfies the `AnyModule` contract.
 *
 * All lifecycle methods are spies so tests can assert call counts and arguments.
 *
 * @param name - The unique module key (used as the property name on the instance map).
 * @param configValue - Value returned by the configure spy.
 */
export function createMockModule(
  name: string,
  configValue: Record<string, unknown> = {},
): AnyModule & {
  configure: ReturnType<typeof vi.fn>;
  initialize: ReturnType<typeof vi.fn>;
  postConfigure: ReturnType<typeof vi.fn>;
  postInitialize: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
} {
  return {
    name,
    version: { toString: () => '1.0.0' } as never,
    configure: vi.fn(async () => configValue),
    initialize: vi.fn(async ({ config }: { config: unknown }) => ({
      name,
      version: '1.0.0',
      config,
    })),
    postConfigure: vi.fn(async () => {}),
    postInitialize: vi.fn(async () => {}),
    dispose: vi.fn(async () => {}),
  };
}

/**
 * Creates a minimal module with only `name` and `initialize` defined.
 * Used to test the "missing optional hooks" branches.
 */
export function createMinimalModule(name: string): AnyModule {
  return {
    name,
    initialize: vi.fn(async () => ({ name, version: '1.0.0', config: {} })),
  };
}

/**
 * Collects all events emitted on an `event$` observable into an array.
 * Returns a cleanup function to unsubscribe.
 */
export function collectEvents(event$: {
  subscribe: (observer: { next: (v: unknown) => void }) => { unsubscribe: () => void };
}): [events: unknown[], cleanup: () => void] {
  const events: unknown[] = [];
  const sub = event$.subscribe({ next: (v) => events.push(v) });
  return [events, () => sub.unsubscribe()];
}
