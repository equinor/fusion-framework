import { describe, it, expect } from 'vitest';

import { resolveRoutingExecutionMode } from '../orchestrator/routing-mode-orchestrator';

describe('resolveRoutingExecutionMode', () => {
  it('returns legacy when isLegacy is true regardless of strategy', () => {
    expect(
      resolveRoutingExecutionMode({
        isLegacy: true,
        routingStrategy: 'query',
        hasAppContextProvider: true,
      }),
    ).toBe('legacy');
  });

  it('returns legacy when isLegacy is true with path strategy', () => {
    expect(
      resolveRoutingExecutionMode({
        isLegacy: true,
        routingStrategy: 'path',
        hasAppContextProvider: true,
      }),
    ).toBe('legacy');
  });

  it('returns custom when custom strategy + app has provider', () => {
    expect(
      resolveRoutingExecutionMode({
        isLegacy: false,
        routingStrategy: 'custom',
        hasAppContextProvider: true,
      }),
    ).toBe('custom');
  });

  it('returns path when custom strategy but no app provider', () => {
    expect(
      resolveRoutingExecutionMode({
        isLegacy: false,
        routingStrategy: 'custom',
        hasAppContextProvider: false,
      }),
    ).toBe('path');
  });

  it('returns query when query strategy', () => {
    expect(
      resolveRoutingExecutionMode({
        isLegacy: false,
        routingStrategy: 'query',
        hasAppContextProvider: true,
      }),
    ).toBe('query');
  });

  it('returns path when path strategy', () => {
    expect(
      resolveRoutingExecutionMode({
        isLegacy: false,
        routingStrategy: 'path',
        hasAppContextProvider: true,
      }),
    ).toBe('path');
  });

  it('returns path when strategy is undefined', () => {
    expect(
      resolveRoutingExecutionMode({
        isLegacy: false,
        routingStrategy: undefined,
        hasAppContextProvider: true,
      }),
    ).toBe('path');
  });
});
