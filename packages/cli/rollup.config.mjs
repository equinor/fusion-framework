import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: './src/bin/main.ts',
    output: {
      file: './dist/bin/main.mjs',
      format: 'es'
    },
    plugins: [typescript({
      outputToFilesystem: false,
      compilerOptions: {
        composite: false,
        declaration: false,
        outDir: './dist/bin',
        declarationDir: './dist/bin',
        sourceMap: false,
      }
    })]
  },
];