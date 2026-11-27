import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';

import pkg from './package.json' with { type: 'json' };

// Externals match exact import paths, so subpath imports are listed on their own.
const externals = [
  ...Object.keys(pkg.dependencies),
  '@equinor/fusion-framework-vite-plugin-octopus/server',
  'keytar',
];
const plugins = [
  json(),
  resolve({ preferBuiltins: true }),
  commonjs(),
  terser({ format: { comments: false } }), // This removes all comments
  replace({
    preventAssignment: true,
    'process.env.MINIMUM_NODE_VERSION': '20',
    'process.env.RECOMMENDED_NODE_LTS': '24',
  }),
];
const output = {
  format: 'esm',
  dir: './bin/build',
  entryFileNames: '[name].mjs',
};

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: {
      bin: 'dist/esm/bin/index.js',
    },
    external: externals,
    plugins,
    output,
  },
  {
    input: {
      cli: 'dist/esm/cli/main.js',
    },

    external: externals.concat(['@equinor/fusion-framework-cli/bin']),
    plugins,
    output,
  },
];
