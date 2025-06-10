import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: {
      index: 'dist/esm/index.js',
      'html/bootstrap': 'dist/esm/html/bootstrap.js',
      'html/sw': 'dist/esm/html/sw.js',
    },
    output: {
      format: 'esm',
      dir: 'dist/bin',
      entryFileNames: '[name].js',
      sourcemap: true,
      strict: false,
    },
    external: ['fsevents', 'jiti', 'lightningcss', 'yaml'],
    plugins: [resolve({ preferBuiltins: true }), commonjs()],
  },
];
