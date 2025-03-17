import { describe, expect, it } from 'vitest';

import { vol } from 'memfs';

import importJSON from '../src/import-json';

describe('import-json', () => {
  it('should load a JSON file with a object', async () => {
    const expected = { foo: 'bar' };
    vol.writeFileSync('config.json', JSON.stringify(expected));
    const result = await importJSON('config.json');
    expect(result).toEqual(expected);
  });

  it('should load a JSON file with a nested object', async () => {
    const expected = { foo: { bar: 'baz' } };
    vol.writeFileSync('config.json', JSON.stringify(expected));
    const result = await importJSON('config.json');
    expect(result).toEqual(expected);
  });

  it('should load a JSON file with a string', async () => {
    const expected = 'foo';
    vol.writeFileSync('config.json', JSON.stringify(expected));
    const result = await importJSON('config.json');
    expect(result).toBe(expected);
  });

  it('should load a JSON file with a number', async () => {
    const expected = 1;
    vol.writeFileSync('config.json', JSON.stringify(expected));
    const result = await importJSON('config.json');
    expect(result).toBe(expected);
  });

  it('should load a JSON file with a boolean', async () => {
    const expected = true;
    vol.writeFileSync('config.json', JSON.stringify(expected));
    const result = await importJSON('config.json');
    expect(result).toBe(expected);
  });

  it('should load a JSON file with an array', async () => {
    const expected = [1, 2, 3];
    vol.writeFileSync('config.json', JSON.stringify(expected));
    const result = await importJSON('config.json');
    expect(result).toEqual(expected);
  });

  it('should throw an error if the file cannot be read', async () => {
    await expect(importJSON('missing.json')).rejects.toMatchObject({
      message: expect.stringContaining('Failed to parse JSON'),
      cause: {
        code: 'ENOENT',
      },
    });
  });

  it('should throw an error if the content is not valid JSON', async () => {
    vol.writeFileSync('invalid.json', 'foo');
    await expect(importJSON('invalid.json')).rejects.toMatchObject({
      message: expect.stringContaining('Failed to parse JSON'),
      cause: {
        message: expect.stringContaining('Unexpected token'),
      },
    });
  });
});
