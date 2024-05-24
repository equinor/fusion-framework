import { readFileSync } from 'node:fs';
import { Spinner } from './spinner.js';
import { chalk } from './format.js';
import { AppConfig } from '../../lib/app-config.js';

export type FusionEnv = 'ci' | 'fqa' | 'fprd';

/* build api endpoint url */
export const getEndpointUrl = async (
    endpoint: string,
    fusionEnv: FusionEnv,
    version: string = '1.0-preview',
) => {
    const { CUSTOM_APPAPI, FUSION_CLI_ENV, FUSION_TOKEN } = process.env;

    const spinner = Spinner.Current;

    /* use consumer provided api url */
    if (CUSTOM_APPAPI) {
        return CUSTOM_APPAPI;
    }

    /* Env has changed get new api url */
    if (FUSION_CLI_ENV !== fusionEnv || !process.env.FUSION_CLI_APPAPI) {
        process.env.FUSION_CLI_ENV = fusionEnv;

        const requestService = await fetch(
            `https://discovery.ci.fusion-dev.net/service-registry/environments/${fusionEnv}/services/apps`,
            {
                headers: {
                    Authorization: `Bearer ${FUSION_TOKEN}`,
                },
            },
        );
        if (!requestService.ok) {
            spinner.fail(
                '😞',
                chalk.redBright('Could not resolve app api endpoint from service discovery api'),
            );
            spinner.info(
                '🤯',
                chalk.yellowBright(
                    `HTTP status ${requestService.status}, ${requestService.statusText}`,
                ),
            );
            return;
        }

        const responseService = await requestService.json();
        process.env.FUSION_CLI_APPAPI = responseService.uri;
    }

    const uri = new URL(`${process.env.FUSION_CLI_APPAPI}/${endpoint}`);
    uri.searchParams.set('api-version', version);

    /* return fresh/cached endpoint url */
    return uri.href;
};

export const validateToken = () => {
    const spinner = Spinner.Current;
    spinner.info('Validating FUSION_TOKEN');

    if (!process?.env?.FUSION_TOKEN) {
        spinner.fail(
            '😞',
            `Missing environment variable "${chalk.yellowBright('FUSION_TOKEN')}"`,
            `\n\nThe "${chalk.yellowBright('FUSION_TOKEN')}" variable is required to perform any actions towards the app api. \nDefine the variable with a valid accessToken in you pipeline|shell before running commands using the app api.`,
        );
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

export const appRegistered = async (appKey: string, env: FusionEnv) => {
    const spinner = Spinner.Current;

    const endpoint = await getEndpointUrl(`apps/${appKey}`, env);
    if (!endpoint) {
        return;
    }

    const requestApp = await fetch(endpoint, {
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

export const uploadAppBundle = async (appKey: string, bundle: string, env: FusionEnv) => {
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

    const endpointUrl = await getEndpointUrl(`bundles/apps/${appKey}`, env);
    if (!endpointUrl) {
        return;
    }

    const requestBundle = await fetch(endpointUrl, {
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

export const tagAppBundle = async (
    tag: string,
    appKey: string,
    version: string,
    env: FusionEnv,
) => {
    const spinner = Spinner.Current;

    const endpointUrl = await getEndpointUrl(`apps/${appKey}/tags/${tag}`, env);
    if (!endpointUrl) {
        return;
    }
    console.log('enpoint', endpointUrl);
    const requestTag = await fetch(endpointUrl, {
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

export const publishAppConfig = async (
    appKey: string,
    version: string,
    config: AppConfig,
    env: FusionEnv,
) => {
    const spinner = Spinner.Current;

    const isAppRegistered = appRegistered(appKey, env);
    if (!isAppRegistered) {
        return;
    }

    const endpointUrl = await getEndpointUrl(`apps/${appKey}/builds/${version}/config`, env);
    if (!endpointUrl) {
        return;
    }

    const requestConfig = await fetch(endpointUrl, {
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
