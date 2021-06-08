module.exports = {
    mode: 'modules',
    name: 'Fusion framework',
    out: 'docs',
    theme: 'node_modules/typedoc-neo-theme/bin/default',
    excludeProtected: true,
    excludePrivate: true,
    excludeExternals: true,
    // excludeNotExported: true,
    readme: 'README.md',
    exclude: ['**/node_modules/typescript', '**/*.spec.ts'],
    plugin: ['typedoc-plugin-lerna-packages', 'typedoc-neo-theme'],
    source: [
        {
            path: 'https://github.com/equinor/fusion-framework/blob/main/',
            line: 'L',
        },
    ],
};
