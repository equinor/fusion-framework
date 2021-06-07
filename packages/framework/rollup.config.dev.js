import config from './rollup.config';

import serve from 'rollup-plugin-serve';

config.plugins.push(
    serve({
        contentBase: ['public', 'dist/build'],
        historyApiFallback: true,
        port: 3000
    })
);

export default config;
