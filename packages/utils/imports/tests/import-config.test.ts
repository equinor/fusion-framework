import { describe, expect, it } from 'vitest';

import { vol } from 'memfs';

import { importConfig } from '../src/import-config';

const generateFileContent = (...content: string[]) => {
  return content.join('\n');
};

const mockConfig = {
  foo: 'bar',
  bar: {
    baz: 'qux',
  },
};

describe('import-config', () => {
  it('should load config from a json file', async () => {
    vol.writeFileSync('config.json', JSON.stringify(mockConfig));
    const result = await importConfig('config');
    expect(result.config).toMatchObject(mockConfig);
  });

  it('should load config from a javascript file', async () => {
    vol.writeFileSync(
      'config.js',
      generateFileContent(
        `export const foo = ${JSON.stringify(mockConfig, null, 2)};`,
        'export default foo;',
      ),
    );
    const result = await importConfig('config');
    expect(result.config).toMatchObject(mockConfig);
  });

  it('should prefer typescript over javascript', async () => {
    vol.writeFileSync(
      'config.js',
      generateFileContent(`export const foo = 'should not be used';`, 'export default foo;'),
    );
    vol.writeFileSync(
      'config.ts',
      generateFileContent(
        `export const foo = ${JSON.stringify(mockConfig, null, 2)};`,
        'export default foo;',
      ),
    );
    const result = await importConfig('config');
    expect(result.config).toMatchObject(mockConfig);
    expect(result.extension).toBe('.ts');
    expect(vol.existsSync('config.js')).toBe(true);
  });

  it('should load config with a custom resolver', async () => {
    type Module = { foo: (value: number) => number };
    vol.writeFileSync(
      'config.ts',
      generateFileContent('export const foo = (value: number) => value + 1;'),
    );
    const result = await importConfig('config', {
      script: {
        resolve: (module: Module) => module.foo(1),
      },
    });
    expect(result.config).toBe(2);
  });

  it('should load a config with a custom async resolver', async () => {
    type Module = { foo: (value: number) => Promise<number> };
    vol.writeFileSync(
      'config.ts',
      generateFileContent('export const foo = async (value: number) => value + 1;'),
    );
    const result = await importConfig('config', {
      script: {
        resolve: async (module: Module) => module.foo(1),
      },
    });
    expect(result.config).toBe(2);
  });

  it('should throw an error if the config file does not exist', async () => {
    await expect(importConfig('config')).rejects.toThrow(
      "No configuration file found for basename 'config'",
    );
  });

  it('should throw an error if base name is not a string', async () => {
    await expect(importConfig(undefined as unknown as string)).rejects.toThrow(
      'baseName must be a non-empty string',
    );
  });
});
