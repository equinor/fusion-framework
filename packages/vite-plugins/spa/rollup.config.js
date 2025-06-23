import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: {
      'html/bootstrap': 'dist/esm/html/bootstrap.js',
      'html/sw': 'dist/esm/html/sw.js',
    },
    output: {
      format: 'esm',
      dir: 'dist',
      entryFileNames: '[name].js',
      sourcemap: true,
      strict: false,
    },
    plugins: [resolve({ preferBuiltins: true }), commonjs()],
  },
];
