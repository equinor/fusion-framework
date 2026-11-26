import { afterEach, describe, expect, it, vi } from 'vitest';

import { supportsExplicitResourceManagement } from '../src/html/webkit/supports-explicit-resource-management.js';

afterEach(() => vi.unstubAllGlobals());

describe('supportsExplicitResourceManagement', () => {
  it('returns true when native using syntax and Symbol.dispose are supported', () => {
    expect(supportsExplicitResourceManagement()).toBe(true);
  });

  it('returns false when Symbol.dispose is unavailable', () => {
    const nativeSymbol = globalThis.Symbol;

    /**
     * Shadows the global Symbol constructor without the disposal feature.
     *
     * @param description - Optional symbol description.
     * @returns A symbol created by the original constructor.
     */
    function symbolWithoutDispose(description?: string): symbol {
      return nativeSymbol(description);
    }

    vi.stubGlobal('Symbol', symbolWithoutDispose);

    expect(supportsExplicitResourceManagement()).toBe(false);
  });

  it('returns false when the parser rejects native using syntax', () => {
    /**
     * Simulates a runtime parser that rejects explicit resource management syntax.
     *
     * @returns Never; the simulated parser always throws.
     * @throws {SyntaxError} To represent an unsupported `using` declaration.
     */
    function rejectUsingSyntax(): never {
      throw new SyntaxError('Unsupported using declaration');
    }

    vi.stubGlobal('Function', rejectUsingSyntax);

    expect(supportsExplicitResourceManagement()).toBe(false);
  });
});
