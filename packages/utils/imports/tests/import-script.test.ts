import { describe, expect, it } from 'vitest';

import { vol } from 'memfs';

import { importScript } from '../src/import-script';

const generateFileContent = (...content: string[]) => {
  return content.join('\n');
};

describe('import-script', () => {
  it('should load a javascript file', async () => {
    vol.writeFileSync(
      'config.js',
      generateFileContent('export const foo = 1;', 'export default foo;'),
    );
    const result = await importScript('config.js');
    expect(result.default).toBe(1);
  });

  it('should load a typescript file', async () => {
    vol.writeFileSync(
      'config.ts',
      generateFileContent('export const foo: number = 1;', 'export default foo;'),
    );
    const result = await importScript('config.ts');
    expect(result.default).toBe(1);
    expect(result.foo).toBe(1);
  });

  it('should load a typescript file with imports', async () => {
    vol.writeFileSync('base.ts', generateFileContent('export const foo: number = 1;'));
    vol.writeFileSync(
      'extended.ts',
      generateFileContent(
        'import { foo } from "./base";',
        'export const bar: number = foo + 1;',
        'export default bar;',
      ),
    );
    const result = await importScript('extended.ts');
    expect(result.default).toBe(2);
    expect(result.bar).toBe(2);
  });

  it('should load a typescript file with functions', async () => {
    type MockModule = { increment: (by?: number) => number };
    vol.writeFileSync(
      'config.ts',
      generateFileContent(
        'let count = 0;',
        'export const increment = (by?: number) => {',
        '  count+=by??1;',
        '  return count;',
        '};',
      ),
    );
    const { increment } = await importScript<MockModule>('config.ts');
    expect(increment()).toBe(1);
    expect(increment(4)).toBe(5);
  });

  it('should fail when loading a non-existent file', async () => {
    await expect(importScript('non-existent.ts')).rejects.toMatchObject({
      cause: {
        message: expect.stringContaining('no such file or directory'),
      },
    });
  });

  it('should load a markdown file with ?raw query parameter', async () => {
    const markdownContent = '# Test Markdown\n\nThis is a test file.';
    vol.writeFileSync('README.md', markdownContent);
    vol.writeFileSync(
      'test.ts',
      generateFileContent("import readmeContent from './README.md?raw';", 'export default readmeContent;'),
    );
    const result = await importScript('test.ts');
    expect(result.default).toBe(markdownContent);
  });

  it('should load a markdown file with ?raw query parameter using relative path with ../', async () => {
    const markdownContent = '# Parent README\n\nThis is a parent README file.';
    vol.writeFileSync('README.md', markdownContent);
    vol.mkdirSync('subdir/nested', { recursive: true });
    vol.writeFileSync(
      'subdir/nested/test.ts',
      generateFileContent("import readmeContent from '../../README.md?raw';", 'export default readmeContent;'),
    );
    const result = await importScript('subdir/nested/test.ts');
    expect(result.default).toBe(markdownContent);
  });
});
