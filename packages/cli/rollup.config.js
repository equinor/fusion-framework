import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json' with { type: 'json' };

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: {
      cli: 'dist/esm/cli/main.js',
      bin: 'dist/esm/bin/index.js',
    },
    output: {
      format: 'esm',
      dir: 'bin/build',
      entryFileNames: '[name].js',
    },

    external: [...Object.keys(pkg.dependencies)],
    plugins: [json(), resolve(), commonjs()],
  },
];
