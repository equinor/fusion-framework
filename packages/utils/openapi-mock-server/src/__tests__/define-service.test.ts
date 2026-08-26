import { describe, expect, it, vi } from 'vitest';

import { defineService } from '../discovery/define-service.js';

const schema = {
  openapi: '3.0.0',
  info: { title: 'People', version: '1.0.0' },
  paths: {},
};

describe('defineService', () => {
  it('normalizes a mock module definition into the server runtime shape', () => {
    const middleware = vi.fn();
    const routes = { '/people': { get: { mock: [{ id: 1 }] } } };

    const definition = defineService({
      key: 'people',
      serviceDiscovery: 'merge',
      schema,
      routes,
      components: { Person: { name: () => 'Leela' } },
      middleware,
    });

    expect(definition).toMatchObject({
      key: 'people',
      serviceDiscovery: 'merge',
      document: schema,
      paths: routes,
    });
    expect(definition.fields?.['Person.name']).toBeTypeOf('function');
    expect(definition.router).toBeDefined();
    expect(middleware).toHaveBeenCalledOnce();
  });

  it('keeps optional merge state absent for a direct-only schema', () => {
    expect(defineService({ key: 'people', serviceDiscovery: false, schema })).toEqual({
      key: 'people',
      serviceDiscovery: false,
      document: schema,
      fields: undefined,
      paths: undefined,
      router: undefined,
    });
  });

  it('allows a merge to inherit its schema from an earlier definition', () => {
    expect(
      defineService({
        key: 'people',
        serviceDiscovery: 'merge',
        components: { Person: { name: 'person.fullName' } },
      }),
    ).toMatchObject({
      key: 'people',
      serviceDiscovery: 'merge',
      document: undefined,
      fields: { 'Person.name': 'person.fullName' },
    });
  });
});
