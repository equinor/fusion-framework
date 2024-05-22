import { readFileSync } from 'node:fs';
import { Spinner } from './spinner.js';
import { chalk } from './format.js';
import { AppConfig } from '../../lib/app-config.js';

/* build api endpoint url */
export const getEndpointUrl = (
    endpoint: string,
    env: 'ci' | 'fqa' | 'fprd' = 'ci',
    version: string = '1.0-preview',
) => {
    const apiurl = `https://fusion-s-apps-${env}.azurewebsites.net`;
    return `${apiurl}/${endpoint}?api-version=${version}`;
};

export const validateToken = () => {
    const spinner = Spinner.Current;
    spinner.info('Validating FUSION_TOKEN');

    if (!process?.env?.FUSION_TOKEN) {
        spinner.fail('😞', chalk.yellowBright('FUSION_TOKEN not found'));
        return false;
    }

    const tokenPayload = process.env.FUSION_TOKEN.split('.')[1];
    const buffer = Buffer.from(tokenPayload, 'base64');
    const userToken = JSON.parse(buffer.toString('utf-8').trim());
    if (Number(userToken.exp) < Date.now() / 1000) {
        spinner.fail(
            '😞',
            chalk.yellowBright(
                'FUSION_TOKEN expired',
                Math.round(Date.now() / 1000 - Number(userToken.exp)),
                'seconds ago',
            ),
        );
        return false;
    }

    spinner.succeed('Token is valid');
    return true;
};

export const appRegistered = async (appKey: string) => {
    const spinner = Spinner.Current;

    const requestApp = await fetch(getEndpointUrl(`apps/${appKey}`), {
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
        },
    });

    if (requestApp.status === 404) {
        spinner.fail(
            '🙅‍♂️',
            chalk.bgRed(
                `The appkey '${appKey}' is not registered, visit the app-admin app and register the application there.`,
            ),
        );
        return;
    }

    if (!requestApp.ok) {
        spinner.fail('😞', chalk.redBright('Could not connect to apps API'));
        spinner.info(
            '🤯',
            chalk.yellowBright(`HTTP status ${requestApp.status}, ${requestApp.statusText}`),
        );
        return;
    }

    spinner.succeed('✅', 'app is registered');

    return await requestApp.json();
};

export const uploadAppBundle = async (appKey: string, bundle: string) => {
    const spinner = Spinner.Current;

    const state: { buffer: Buffer | null } = {
        buffer: null,
    };

    try {
        state.buffer = readFileSync(bundle);
    } catch {
        spinner.fail('😞', 'Could not retreive app bundle, does it exist?');
        return;
    }

    const requestBundle = await fetch(getEndpointUrl(`bundles/apps/${appKey}`), {
        method: 'POST',
        body: state.buffer,
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
            'Content-Type': 'application/zip',
        },
    });

    if (requestBundle.status === 409) {
        spinner.info('🤯', chalk.yellowBright(`This app version is already published`));
        spinner.fail('😞', chalk.redBright('Failed to publish bundle'));
        return;
    }

    if (!requestBundle.ok) {
        spinner.info(
            '🤯',
            chalk.yellowBright(`HTTP status ${requestBundle.status}, ${requestBundle.statusText}`),
        );
        spinner.fail('😞', chalk.redBright('Failed to publish bundle'));
        return;
    }

    return await requestBundle.json();
};

export const tagAppBundle = async (tag: string, appKey: string, version: string) => {
    const spinner = Spinner.Current;

    const requestTag = await fetch(getEndpointUrl(`apps/${appKey}/tags/${tag}`), {
        method: 'PUT',
        body: JSON.stringify({ version }),
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!requestTag.ok) {
        spinner.fail('😞', chalk.redBright('Failed to tag bundle'));
        spinner.info(
            '🤯',
            chalk.yellowBright(`HTTP status ${requestTag.status}, ${requestTag.statusText}`),
        );
        return;
    }

    return await requestTag.json();
};

export const publishAppConfig = async (appKey: string, version: string, config: AppConfig) => {
    const spinner = Spinner.Current;

    if (!validateToken()) {
        return;
    }

    const isAppRegistered = appRegistered(appKey);
    if (!isAppRegistered) {
        return;
    }

    const requestConfig = await fetch(getEndpointUrl(`apps/${appKey}/builds/${version}/config`), {
        method: 'PUT',
        body: JSON.stringify(config),
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (requestConfig.status === 404) {
        spinner.fail('😞', chalk.redBright('App version is not published'));
        spinner.info(
            '🤯',
            chalk.yellowBright(`HTTP status ${requestConfig.status}, ${requestConfig.statusText}`),
        );
        return;
    }

    if (!requestConfig.ok) {
        spinner.fail('😞', chalk.redBright('Failed to upload config'));
        spinner.info(
            '🤯',
            chalk.yellowBright(`HTTP status ${requestConfig.status}, ${requestConfig.statusText}`),
        );
        return;
    }

    return await requestConfig.json();
};
