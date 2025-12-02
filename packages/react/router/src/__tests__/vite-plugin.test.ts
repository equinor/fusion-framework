import { describe, it, expect, beforeEach, vi } from 'vitest';
import path from 'node:path';
import { reactRouterPlugin } from '../vite-plugin/plugin';

interface ReactRouterPlugin {
  transform: (code: string, id: string) => string;
  config: (config: { root?: string }) => void;
}

/**
 * Normalizes whitespace in code strings for comparison
 * - Trims leading/trailing whitespace
 * - Removes all tabs and newlines
 * - Collapses multiple consecutive spaces to single space
 */
function normalizeCode(code: string): string {
  return code
    .trim()
    .replace(/\r\n/g, '\n') // Normalize line endings first
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/[ ]+/g, '') // Collapse multiple spaces to single space
    .trim(); // Trim again after replacements
}

describe('reactRouterPlugin', () => {
  let plugin: ReactRouterPlugin;
  // Use absolute path to the test file directory so relative imports resolve correctly
  const testFileId = path.resolve(__dirname, 'vite-plugin.test.ts');

  beforeEach(() => {
    vi.resetAllMocks();
    plugin = reactRouterPlugin({ debug: false }) as unknown as ReactRouterPlugin;
    // Set root to the package root (parent of src)
    plugin.config({ root: path.resolve(__dirname, '../..') });
  });

  it('should transform a simple route() call to RouteObject', () => {
    const inputCode = [
      `import { route } from '@equinor/fusion-framework-react-router/routes';`,
      `export const routes = route('home', './mocks/pages/HomePage.tsx');`,
    ].join('\n');

    const transformResult = plugin.transform(inputCode, testFileId);

    const expected = [
      `import React from 'react';`,
      `import { useLoaderData, useActionData, useRouteError } from 'react-router-dom';`,
      `import { useRouterContext, routerContext } from '@equinor/fusion-framework-react-router';`,
      `import { default as HomePage, handle as handleHomePage } from './mocks/pages/HomePage.tsx';`,
      `export const routes = [{ path: 'home', Component: HomePage, handle: handleHomePage }];`,
    ].join('\n');

    expect(transformResult).not.toBeNull();
    expect(transformResult).toBeDefined();

    // Normalize whitespace for comparison
    expect(normalizeCode(transformResult)).toBe(normalizeCode(expected));
  });

  it('should transform route with clientLoader and ErrorElement', () => {
    const inputCode = [
      `import { route } from '@equinor/fusion-framework-react-router/routes';`,
      `export const routes = route(':id', './mocks/pages/UserDetailPage.tsx');`,
    ].join('\n');

    const transformResult = plugin.transform(inputCode, testFileId);

    expect(transformResult).toBeDefined();
    expect(transformResult).not.toBeNull();

    const expected = [
      `import React from 'react';`,
      `import { useLoaderData, useActionData, useRouteError } from 'react-router-dom';`,
      `import { useRouterContext, routerContext } from '@equinor/fusion-framework-react-router';`,
      `import {`,
      `    default as UserDetailPage,`,
      `    clientLoader as clientLoaderUserDetailPage,`,
      `    ErrorElement as ErrorElementUserDetailPage`,
      `} from './mocks/pages/UserDetailPage.tsx';`,
      `export const routes = [{`,
      `        path: ':id',`,
      `        Component: UserDetailPage,`,
      `        loader: clientLoaderUserDetailPage,`,
      `        errorElement: ErrorElementUserDetailPage`,
      `    }];`,
    ].join('\n');

    // Normalize whitespace for comparison
    expect(normalizeCode(transformResult)).toBe(normalizeCode(expected));
  });

  it('should transform complex DSL with layout, prefix, index, and routes', () => {
    // Complex DSL code using layout, prefix, index, and route
    // Note: The plugin processes nested calls iteratively, so we need to ensure
    // the structure matches what extractFilePaths can handle
    const inputCode = [
      `import { layout, prefix, index, route } from '@equinor/fusion-framework-react-router/routes';`,
      `export const routes = layout('./mocks/pages/MainLayout.tsx', [`,
      `  index('./mocks/pages/HomePage.tsx'),`,
      `  prefix('products', [`,
      `    index('./mocks/pages/ProductsPage.tsx'),`,
      `    route(':id', './mocks/pages/ProductPage.tsx')`,
      `  ]),`,
      `]);`,
    ].join('\n');

    const transformResult = plugin.transform(inputCode, testFileId);

    expect(transformResult).toBeDefined();
    expect(transformResult).not.toBeNull();

    const expected = [
      `import React from 'react';`,
      `import { useLoaderData, useActionData, useRouteError } from 'react-router-dom';`,
      `import { useRouterContext, routerContext } from '@equinor/fusion-framework-react-router';`,
      `import { default as HomePage, handle as handleHomePage } from './mocks/pages/HomePage.tsx';`,
      `import { default as ProductsPage, handle as handleProductsPage } from './mocks/pages/ProductsPage.tsx';`,
      `import { default as MainLayout, handle as handleMainLayout } from './mocks/pages/MainLayout.tsx';`,
      `import { default as ProductPage, handle as handleProductPage } from './mocks/pages/ProductPage.tsx';`,
      `export const routes = [{`,
      `  Component: MainLayout,`,
      `  handle: handleMainLayout,`,
      `  children: [`,
      `    {`,
      `      index: true,`,
      `      Component: HomePage,`,
      `      handle: handleHomePage`,
      `    },`,
      `    {`,
      `      path: 'products',`,
      `      children: [{`,
      `        index: true,`,
      `        Component: ProductsPage,`,
      `        handle: handleProductsPage`,
      `      }, {`,
      `        path: ':id',`,
      `        Component: ProductPage,`,
      `        handle: handleProductPage`,
      `      }]`,
      `    },`,
      `  ]`,
      `}];`,
    ].join('\n');

    // Normalize whitespace for comparison
    expect(normalizeCode(transformResult)).toBe(normalizeCode(expected));
  });
});
