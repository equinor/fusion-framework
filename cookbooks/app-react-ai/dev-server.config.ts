import { config as loadDotEnv } from 'dotenv';
import { defineDevServerConfig } from '@equinor/fusion-framework-cli/lib';

// Load environment variables from .env file
loadDotEnv({ path: '../../.env' });

export default defineDevServerConfig((_env, { base }) => {
    if (!base.api.processServices) {
        return base;
    }
    const processServices = base.api.processServices;
    base.api.processServices = (dataResponse, route) => {
        const { data, routes = [] } = processServices(dataResponse, route);
        data.push({
            key: 'cognitive-search',
            name: 'Cognitive Services',
            uri: 'http://localhost:3000/@fusion-api/cognitive-search',
            proxyTarget: String(process.env.AZURE_SEARCH_ENDPOINT),
        });
        routes.push({
            match: '/cognitive-search/*sub',
            proxy: {
                secure: false,
                target: String(process.env.AZURE_SEARCH_ENDPOINT),
                rewrite: (path) => path.replace('/cognitive-search', ''),
            },
        });
        return { data, routes };
    };
    return base;
});