import { Spinner } from './spinner.js';
import { chalk } from './format.js';
import { bundleApplication } from '../bundle-application.js';

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

    spinner.info('Token found');

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

export const uploadBundle = async (appKey: string) => {
    const spinner = Spinner.Current;

    /* Create zipped bundle */
    const zipBuffer = await bundleApplication({
        archive: 'app-bundle.zip',
        outDir: 'dist',
        getBuffer: true,
    });

    if (!zipBuffer) {
        spinner.fail('😞', 'Could not retreive zip from app pack');
        return;
    }

    const requestBundle = await fetch(getEndpointUrl(`bundles/apps/${appKey}`), {
        method: 'POST',
        body: zipBuffer,
        headers: {
            Authorization: `Bearer ${process.env.FUSION_TOKEN}`,
            'Content-Type': 'application/zip',
        },
    });

    if (!requestBundle.ok) {
        spinner.fail('😞', chalk.redBright('Failed to publish bundle'));
        spinner.info(
            '🤯',
            chalk.yellowBright(`HTTP status ${requestBundle.status}, ${requestBundle.statusText}`),
        );
        return;
    }

    return await requestBundle.json();
};

export const tagBundle = async (tag: string, appKey: string, version: string) => {
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
