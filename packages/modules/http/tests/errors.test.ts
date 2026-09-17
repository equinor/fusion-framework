import { describe, expect, it } from 'vitest';

import { ClientNotFoundException } from '../src/errors/ClientNotFoundException.js';
import { HttpClientException } from '../src/errors/HttpClientException.js';
import { HttpJsonResponseError } from '../src/errors/HttpJsonResponseError.js';
import { HttpResponseError } from '../src/errors/HttpResponseError.js';
import { MissingAccessTokenException } from '../src/errors/MissingAccessTokenException.js';
import { ServerSentEventResponseError } from '../src/errors/ServerSentEventResponseError.js';

describe('HttpClientException', () => {
  /** Simulates an equivalent error class from a separate bundled copy of this module. */
  class ForeignRuntimeHttpClientException extends Error {
    /** Matches the discriminator `HttpClientException.is` checks for. */
    public readonly type = 'HttpClientException' as const;
  }

  it('identifies general and specialized HTTP client errors', () => {
    expect(HttpClientException.is(new HttpClientException('general failure'))).toBe(true);
    expect(HttpClientException.is(new MissingAccessTokenException('no token'))).toBe(true);
  });

  it('identifies an equivalent error created by another runtime/bundle scope', () => {
    const error = new ForeignRuntimeHttpClientException('remote failure');

    expect(error).not.toBeInstanceOf(HttpClientException);
    expect(HttpClientException.is(error)).toBe(true);
  });

  it('rejects unrelated thrown values', () => {
    expect(HttpClientException.is(new Error('unrelated'))).toBe(false);
    expect(HttpClientException.is({ type: 'OtherError' })).toBe(false);
    expect(HttpClientException.is({ type: HttpClientException.Type })).toBe(false);
    expect(HttpClientException.is('unrelated')).toBe(false);
    expect(HttpClientException.is(undefined)).toBe(false);
  });
});

describe('MissingAccessTokenException', () => {
  /** Simulates an equivalent error class from a separate bundled copy of this module. */
  class ForeignRuntimeMissingAccessTokenException extends Error {
    /** Matches the discriminator `HttpClientException.is` checks for. */
    public readonly type = HttpClientException.Type;
    /** Matches the name `MissingAccessTokenException.is` checks for. */
    public override readonly name = 'MissingAccessTokenException';
  }

  it('identifies its own instances', () => {
    expect(MissingAccessTokenException.is(new MissingAccessTokenException('no token'))).toBe(
      true,
    );
  });

  it('identifies an equivalent error created by another runtime/bundle scope', () => {
    const error = new ForeignRuntimeMissingAccessTokenException('no token, remote bundle');

    expect(error).not.toBeInstanceOf(MissingAccessTokenException);
    expect(MissingAccessTokenException.is(error)).toBe(true);
  });

  it('rejects a general HttpClientException that is not this specialization', () => {
    expect(MissingAccessTokenException.is(new HttpClientException('unrelated'))).toBe(false);
  });

  it('rejects unrelated thrown values', () => {
    expect(MissingAccessTokenException.is(new Error('unrelated'))).toBe(false);
    expect(MissingAccessTokenException.is({ type: 'OtherError' })).toBe(false);
    expect(MissingAccessTokenException.is({ type: HttpClientException.Type })).toBe(false);
    expect(MissingAccessTokenException.is('unrelated')).toBe(false);
    expect(MissingAccessTokenException.is(undefined)).toBe(false);
  });

  it('preserves the cause option', () => {
    const cause = new Error('token acquisition failed');
    const error = new MissingAccessTokenException('no token', { cause });

    expect(error.cause).toBe(cause);
    expect(error.name).toBe('MissingAccessTokenException');
  });
});

describe('HttpResponseError', () => {
  const response = new Response(null, { status: 500 });

  it('identifies its own instances and is recognized as a general HttpClientException', () => {
    const error = new HttpResponseError('failed', response);

    expect(HttpResponseError.is(error)).toBe(true);
    expect(HttpClientException.is(error)).toBe(true);
    expect(error.response).toBe(response);
  });

  it('rejects a general HttpClientException that carries no response', () => {
    expect(HttpResponseError.is(new HttpClientException('unrelated'))).toBe(false);
  });

  it('rejects unrelated thrown values', () => {
    expect(HttpResponseError.is(new Error('unrelated'))).toBe(false);
    expect(HttpResponseError.is(undefined)).toBe(false);
  });
});

describe('HttpJsonResponseError', () => {
  const response = new Response(null, { status: 500 });

  it('identifies its own instances and is recognized by the base HttpResponseError', () => {
    const error = new HttpJsonResponseError('failed', response, { data: { code: 'X' } });

    expect(HttpJsonResponseError.is(error)).toBe(true);
    expect(HttpResponseError.is(error)).toBe(true);
    expect(error.data).toEqual({ code: 'X' });
  });

  it('rejects a plain HttpResponseError that is not the JSON specialization', () => {
    expect(HttpJsonResponseError.is(new HttpResponseError('failed', response))).toBe(false);
  });
});

describe('ServerSentEventResponseError', () => {
  const response = new Response(null, { status: 500 });

  it('identifies its own instances and is recognized by the base HttpResponseError', () => {
    const error = new ServerSentEventResponseError('failed', response);

    expect(ServerSentEventResponseError.is(error)).toBe(true);
    expect(HttpResponseError.is(error)).toBe(true);
  });

  it('rejects a plain HttpResponseError that is not the SSE specialization', () => {
    expect(ServerSentEventResponseError.is(new HttpResponseError('failed', response))).toBe(
      false,
    );
  });
});

describe('ClientNotFoundException', () => {
  it('identifies its own instances and is recognized as a general HttpClientException', () => {
    const error = new ClientNotFoundException('No registered http client for key [missing]');

    expect(ClientNotFoundException.is(error)).toBe(true);
    expect(HttpClientException.is(error)).toBe(true);
  });

  it('rejects unrelated thrown values', () => {
    expect(ClientNotFoundException.is(new Error('unrelated'))).toBe(false);
    expect(ClientNotFoundException.is(new HttpClientException('unrelated'))).toBe(false);
  });
});
