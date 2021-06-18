module.exports = {
    mode: 'modules',
    name: 'Fusion framework',
    out: 'docs',
    theme: 'node_modules/typedoc-neo-theme/bin/default',
    excludeProtected: true,
    excludePrivate: true,
    excludeExternals: true,
    excludeNotExported: true,
    readme: 'README.md',
    exclude: ['**/node_modules/typescript'],
    source: [
        {
            path: 'https://github.com/equinor/fusion-framework/blob/main/',
            line: 'L',
        },
    ],
    customStyles: [
        {
            path: '/assets/css/custom.css',
        },
    ],
};
