import { describe, it, expect, beforeEach } from 'vitest';

import { HttpClientConfigurator } from '../src/configurator';
import { HttpClient } from '../src/lib';
import { HttpClientProvider } from '../src';
import { lastValueFrom } from 'rxjs';

let provider: HttpClientProvider;

describe('HttpClient', () => {
    beforeEach(() => {
        const config = new HttpClientConfigurator(HttpClient);
        config.configureClient('foo', 'http://localhost:3000');
        provider = new HttpClientProvider(config);
    });

    it('should create instance', () => {
        const client = provider.createClient('foo');
        expect(client).toBeDefined();
        expect(client.uri).toBe('http://localhost:3000');
    });

    it('should allow providing headers in request', async () => {});

    it('should not modify configured headers', async () => {
        // create a new client from configuration
        const fooClient = provider.createClient('foo');
        fooClient.requestHandler.setHeader('x-foo', 'bar');

        // generate a RequestInit object
        const fooRequest = await lastValueFrom(
            fooClient.requestHandler.process({ path: '/api', uri: fooClient.uri }),
        );

        expect((fooRequest.headers as Headers)?.get('x-foo')).toBe('bar');

        // create a new client from the same configuration
        const barClient = provider.createClient('foo');

        // generate a RequestInit object
        const barRequest = await lastValueFrom(
            barClient.requestHandler.process({ path: '/api', uri: barClient.uri }),
        );

        // expect the request header to not been modified
        expect((barRequest.headers as Headers)?.get('x-foo')).toBeUndefined();
    });
});
