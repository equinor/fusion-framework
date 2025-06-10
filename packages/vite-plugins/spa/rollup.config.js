import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: {
      plugin: 'src/plugin.ts',
      'html/bootstrap': 'src/html/bootstrap.ts',
      'html/sw': 'src/html/sw.ts',
    },
    output: {
      format: 'esm',
      dir: 'dist',
      entryFileNames: '[name].js',
      sourcemap: true,
      strict: false,
    },
    external: ['fsevents', 'jiti', 'lightningcss', 'yaml'],
    plugins: [typescript({ declaration: true }), resolve({ preferBuiltins: true }), commonjs()],
  },
];
