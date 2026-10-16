import { describe, expect, it, vi } from 'vitest';
import { createMiddleware } from '../routing/create-middleware.js';

describe('createMiddleware', () => {
  it('preserves the callback identity and synchronous result', () => {
    const callback = vi.fn(() => 'downstream result');
    const middleware = createMiddleware(callback);
    expect(middleware).toBe(callback);
    expect(middleware()).toBe('downstream result');
    expect(callback).toHaveBeenCalledOnce();
  });

  it('preserves the original promise', async () => {
    const result = Promise.resolve('downstream result');
    const middleware = createMiddleware(() => result);
    expect(middleware()).toBe(result);
    await expect(middleware()).resolves.toBe('downstream result');
  });

  it('does not catch synchronous failures', () => {
    const error = new Error('Access denied');
    const middleware = createMiddleware(() => {
      throw error;
    });
    expect(() => middleware()).toThrow(error);
  });

  it('does not catch asynchronous failures', async () => {
    const error = new Error('Downstream failed');
    const middleware = createMiddleware(async () => {
      throw error;
    });
    await expect(middleware()).rejects.toBe(error);
  });
});
