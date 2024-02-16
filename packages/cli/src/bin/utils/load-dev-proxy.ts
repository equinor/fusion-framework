import { Spinner } from './spinner.js';
import { type Express } from 'express';
import { initiateConfig, type ConfigExecuterEnv } from '../../lib/utils/config.js';
import { getProxyConfigFilePath, loadAppConfig, proxyFileExist } from '../../lib/dev-config.js';
import path from 'path';
import { chalk } from '../utils/format.js';

export const devAppConfig = async (env: ConfigExecuterEnv, app: Express) => {
    if (proxyFileExist(env.root)) {
        const spinner = Spinner.Global({ prefixText: chalk.dim('dev-server') });
        try {
            spinner.info(` resolve dev config form: ${getProxyConfigFilePath(env.root)}`);
            spinner.start('dev proxy config configuration');
            const configExecutor = await loadAppConfig(getProxyConfigFilePath(env.root));
            const appConfig = await initiateConfig(configExecutor, env);

            if (appConfig.express) {
                appConfig.express(app);
            }

            if (appConfig.widgets) {
                appConfig.widgets.forEach((widget) => {
                    const serverPath = `/widgets/${widget.name}`;

                    app.get(serverPath, async (req, res) => {
                        const entryPoint = path.resolve(
                            env.root!,
                            `${widget.assetPath}${widget.entryPoint}`,
                        );
                        spinner.info(serverPath + ' proxy request: ' + entryPoint);
                        res.json({
                            widget,
                            entryPoint,
                        });
                    });
                });
            }

            spinner.succeed();
        } catch (err) {
            spinner.fail(`failed to resolve dev proxy config`);
            throw err;
        }
    }
    return app;
};
