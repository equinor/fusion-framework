import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: 'src/main.tsx',
    output: {
      file: 'dist/main.js', // Output bundle file
      format: 'esm',
      sourcemap: true,
    },
    plugins: [typescript(), resolve(), commonjs()],
  },
];
