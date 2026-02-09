import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

import pkg from './package.json' with { type: 'json' };

const externals = [...Object.keys(pkg.dependencies), 'keytar'];
const plugins = [
  json(),
  resolve({ preferBuiltins: true }),
  commonjs({
    sourceMap: false,
  }),
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
    maxParallelFileOps: 10000,
    input: {
      bin: 'dist/esm/bin/index.js',
    },
    perf: true,
    external: externals,
    plugins,
    output,
  },
  {
    maxParallelFileOps: 10000,
    input: {
      cli: 'dist/esm/cli/main.js',
    },
    perf: true,
    external: externals.concat(['@equinor/fusion-framework-cli/bin']),
    plugins,
    output,
  },
];
