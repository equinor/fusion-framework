import { describe, expect, it } from 'vitest';
import { validateRouteSchema } from '../build/validate-route-schema.js';

describe('validateRouteSchema', () => {
  it('retains only sitemap fields and validates string descriptions', () => {
    expect(
      validateRouteSchema(
        {
          description: 'Demand',
          params: { id: 'Demand identifier' },
          search: { tab: 'Selected tab' },
          title: 'UI-only metadata',
        },
        'page.tsx',
      ),
    ).toEqual({
      description: 'Demand',
      params: { id: 'Demand identifier' },
      search: { tab: 'Selected tab' },
    });
    expect(validateRouteSchema({}, 'page.tsx')).toEqual({});
  });

  it('keeps prototype-like parameter names as own string descriptions', () => {
    const value: unknown = JSON.parse('{"params":{"__proto__":"Parameter","constructor":"Name"}}');
    const schema = validateRouteSchema(value, 'page.tsx');
    expect(Object.hasOwn(schema.params ?? {}, '__proto__')).toBe(true);
    expect(schema.params?.constructor).toBe('Name');
    expect(Object.getPrototypeOf(schema.params)).toBe(Object.prototype);
  });

  it.each([
    [null, 'route schema must be an object literal'],
    [[], 'route schema must be an object literal'],
    ['invalid', 'route schema must be an object literal'],
    [{ description: 42 }, 'description must be a string'],
    [{ params: [] }, 'params must contain string descriptions'],
    [{ search: null }, 'search must contain string descriptions'],
    [{ params: { id: 42 } }, 'params.id must be a string'],
    [{ search: { tab: false } }, 'search.tab must be a string'],
  ])('reports invalid metadata %j with source context', (value, message) => {
    expect(() => validateRouteSchema(value, 'page.tsx')).toThrow(`page.tsx: ${message}`);
  });
});
