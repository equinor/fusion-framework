import { afterEach, describe, expect, it, vi } from 'vitest';

import { suppressAgGridLicenseBanner } from '../suppress-ag-grid-license-banner';

describe('suppressAgGridLicenseBanner', () => {
  const originalConsoleError = console.error;

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('drops AG Grid license banner lines logged through console.error', () => {
    const spy = vi.fn();
    console.error = spy;

    const restore = suppressAgGridLicenseBanner();
    console.error('*'.repeat(20));
    console.error('AG Grid: License Key Not Found');
    console.error('See https://www.ag-grid.com/react-data-grid/licensing/ for details.');
    restore();

    expect(spy).not.toHaveBeenCalled();
  });

  it('passes unrelated console.error calls through unchanged', () => {
    const spy = vi.fn();
    console.error = spy;

    const restore = suppressAgGridLicenseBanner();
    console.error('boom', { cause: 'network' });
    restore();

    expect(spy).toHaveBeenCalledWith('boom', { cause: 'network' });
  });

  it('restores the original console.error after calling the returned function', () => {
    const spy = vi.fn();
    console.error = spy;

    const restore = suppressAgGridLicenseBanner();
    restore();
    console.error('AG Grid: License Key Not Found');

    expect(spy).toHaveBeenCalledWith('AG Grid: License Key Not Found');
  });
});
