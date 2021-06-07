import resolve from '@rollup/plugin-node-resolve';
// import commonJs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: {
        format: 'esm',
        dir: 'dist/build',
        sourcemap: true,
    },
    // external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
        resolve(),
        typescript({tsconfig: 'tsconfig.rollup.json'}),
        // commonJs(),
        
    ],
};
