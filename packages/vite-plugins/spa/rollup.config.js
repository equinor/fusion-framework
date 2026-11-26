import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: {
      'html/bootstrap': 'dist/esm/html/webkit/bootstrap-feature-compatibility.js',
      'html/sw': 'dist/esm/html/sw.js',
    },
    output: {
      format: 'esm',
      dir: 'dist',
      entryFileNames: '[name].js',
      // Keep native and fallback branch filenames distinct for the browser dispatcher.
      chunkFileNames: (chunkInfo) => {
        const source = chunkInfo.facadeModuleId?.replace(/\\/g, '/');
        if (source?.endsWith('/html/webkit/bootstrap-native.js')) {
          return 'html/bootstrap-[hash].js';
        }
        if (source?.endsWith('/html/webkit/bootstrap-webkit-fallback.js')) {
          return 'html/bootstrap-webkit-fallback-[hash].js';
        }
        return 'html/[name]-[hash].js';
      },
      sourcemap: true,
      strict: false,
    },
    plugins: [resolve({ browser: true, preferBuiltins: false }), commonjs()],
  },
];
