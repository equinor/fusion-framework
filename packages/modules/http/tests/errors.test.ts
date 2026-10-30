import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import {
  ClientNotFoundException,
  HttpException,
  HttpJsonResponseError,
  HttpResponseError,
  MissingAccessTokenException,
  ServerSentEventResponseError,
} from '../src/errors/index.js';

const guards = [
  HttpException.is,
  ClientNotFoundException.is,
  MissingAccessTokenException.is,
  HttpResponseError.is,
  HttpJsonResponseError.is,
  ServerSentEventResponseError.is,
];

describe('HTTP error guards', () => {
  it('identifies local errors and preserves the response subtype hierarchy', () => {
    const errors = [
      new HttpException('HTTP failure'),
      new ClientNotFoundException('Unknown client'),
      new MissingAccessTokenException('Missing token'),
      new HttpResponseError('Response failure', new Response()),
      new HttpJsonResponseError('JSON failure', new Response()),
      new ServerSentEventResponseError('SSE failure', new Response()),
    ];

    // The matrix prevents a concrete guard from accidentally inheriting the broad base guard.
    for (const [index, error] of errors.entries()) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpException);
      // Response guards must recognize both built-in response subtypes.
      for (const [guardIndex, guard] of guards.entries()) {
        expect(guard(error)).toBe(
          guardIndex === 0 || guardIndex === index || (guardIndex === 3 && index >= 3),
        );
      }
    }
  });

  it('identifies real duplicate module copies without shared prototypes', async () => {
    vi.resetModules();
    const foreign = await import('../src/errors/index.js');
    const errors = [
      new foreign.HttpException('HTTP failure'),
      new foreign.ClientNotFoundException('Unknown client'),
      new foreign.MissingAccessTokenException('Missing token'),
      new foreign.HttpResponseError('Response failure', { status: 500 }),
      new foreign.HttpJsonResponseError('JSON failure', null, { data: 'unvalidated' }),
      new foreign.ServerSentEventResponseError('SSE failure', undefined),
    ];

    // Each duplicate constructor must remain recognizable without local instanceof support.
    for (const [index, error] of errors.entries()) {
      expect(error).not.toBeInstanceOf(HttpException);
      // The same classification matrix must hold across bundle boundaries.
      for (const [guardIndex, guard] of guards.entries()) {
        expect(guard(error)).toBe(
          guardIndex === 0 || guardIndex === index || (guardIndex === 3 && index >= 3),
        );
      }
    }
  });

  it('accepts branded structural errors without promising response or data shapes', () => {
    const error: unknown = {
      type: 'HttpException',
      name: 'HttpJsonResponseError',
      message: 'Foreign JSON failure',
      response: null,
      data: 42,
      cause: 'Foreign cause',
    };

    expect(HttpException.is(error)).toBe(true);
    expect(HttpResponseError.is(error)).toBe(true);
    expect(HttpJsonResponseError.is(error)).toBe(true);
    // Unknown payloads must be validated separately before consumers use response or data APIs.
    if (HttpJsonResponseError.is(error)) {
      expectTypeOf(error.response).toEqualTypeOf<unknown>();
      expectTypeOf(error.data).toEqualTypeOf<unknown>();
      expect(error.response).toBeNull();
      expect(error.data).toBe(42);
      expect(error.cause).toBe('Foreign cause');
    } else {
      throw new Error('Expected structural JSON error');
    }

    const response: unknown = {
      type: HttpException.Type,
      name: HttpResponseError.Name,
      message: 'No response payload',
      response: undefined,
    };
    expect(HttpResponseError.is(response)).toBe(true);
    // Even a plain response guard must not narrow the payload to the default DOM Response type.
    if (HttpResponseError.is(response)) {
      expectTypeOf(response.response).toEqualTypeOf<unknown>();
    }
  });

  it('preserves local consumer-defined response subclasses', () => {
    /** Models a consumer-specific response failure with its own name. */
    class CustomResponseError extends HttpJsonResponseError {
      /** Distinguishes a consumer failure from the built-in JSON error name. */
      override name = 'CustomResponseError';
    }
    const error = new CustomResponseError('Custom failure', new Response());

    expect(HttpException.is(error)).toBe(true);
    expect(HttpResponseError.is(error)).toBe(true);
    expect(HttpJsonResponseError.is(error)).toBe(true);
    expect(ServerSentEventResponseError.is(error)).toBe(false);
  });

  it.each([
    undefined,
    null,
    false,
    0,
    'HttpException',
    Symbol('HttpException'),
    () => undefined,
    new Error('Unrelated error'),
    { name: 'MissingAccessTokenException', message: 'Unbranded' },
    { type: 'OtherException', name: 'HttpException', message: 'Wrong module' },
    { type: HttpException.Type },
    { type: HttpException.Type, name: 1, message: 'Wrong name type' },
    { type: HttpException.Type, name: 'HttpException', message: 1 },
    { type: HttpException.Type, name: 'HttpException', message: 'Invalid stack', stack: 1 },
  ])('rejects unrelated or malformed unknown values: %s', (error) => {
    // Every concrete guard must reject values that fail the shared error contract.
    for (const guard of guards) {
      expect(guard(error)).toBe(false);
    }
  });

  it.each([HttpResponseError.Name, HttpJsonResponseError.Name, ServerSentEventResponseError.Name])(
    'requires the response field for structural %s errors',
    (name) => {
      const error = { type: HttpException.Type, name, message: 'Missing response' };

      expect(HttpException.is(error)).toBe(true);
      expect(HttpResponseError.is(error)).toBe(false);
      expect(HttpJsonResponseError.is(error)).toBe(false);
      expect(ServerSentEventResponseError.is(error)).toBe(false);
    },
  );

  it('does not classify unknown structural subclasses as a built-in concrete error', () => {
    const error = {
      type: HttpException.Type,
      name: 'CustomResponseError',
      message: 'Custom failure',
      response: new Response(),
    };
    expect(HttpException.is(error)).toBe(true);
    // Custom foreign names have no verifiable built-in response ancestry.
    for (const guard of guards.slice(1)) {
      expect(guard(error)).toBe(false);
    }
  });
});

describe('HTTP error constructor contracts', () => {
  it('preserves messages, causes, response identity, and optional JSON data', () => {
    const cause = new Error('Original failure');
    const response = { status: 500 };
    const data = { detail: 'Rejected' };
    const errors = [
      new HttpException('HTTP failure', { cause }),
      new ClientNotFoundException('Unknown client', { cause }),
      new MissingAccessTokenException('Missing token', { cause }),
      new HttpResponseError('Response failure', response, { cause }),
      new HttpJsonResponseError('JSON failure', response, { cause, data }),
      new ServerSentEventResponseError('SSE failure', response, { cause, data }),
    ];

    // Check each public message independently of the class name changes.
    expect(errors.map((error) => error.message)).toEqual([
      'HTTP failure',
      'Unknown client',
      'Missing token',
      'Response failure',
      'JSON failure',
      'SSE failure',
    ]);
    // Concrete names provide the stable cross-bundle subclass discriminator.
    expect(errors.map((error) => error.name)).toEqual([
      'HttpException',
      'ClientNotFoundException',
      'MissingAccessTokenException',
      'HttpResponseError',
      'HttpJsonResponseError',
      'ServerSentEventResponseError',
    ]);
    // Standard ErrorOptions must survive every constructor in the inheritance chain.
    for (const error of errors) {
      expect(error.cause).toBe(cause);
      expect(error.type).toBe(HttpException.Type);
    }
    const responseError = new HttpResponseError('Response failure', response, { cause });
    const jsonError = new HttpJsonResponseError('JSON failure', response, { cause, data });
    const sseError = new ServerSentEventResponseError('SSE failure', response, { cause, data });
    expect(responseError.response).toBe(response);
    expect(jsonError.response).toBe(response);
    expect(jsonError.data).toBe(data);
    expect(sseError.response).toBe(response);
    expect(sseError).not.toHaveProperty('data');
    expect(new HttpJsonResponseError('No data', response).data).toBeUndefined();
    expect(new ClientNotFoundException().message).toBe('');
    expect(new ClientNotFoundException(undefined, { cause }).cause).toBe(cause);
  });
});
