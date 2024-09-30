export type FusionEnv = 'ci' | 'fqa' | 'tr' | 'fprd';
import fetch from 'node-fetch';
import https from 'https';

/**
 * Retreive full endpoint URI to env in service-discovery
 * @param endpoint <string> The endpoint to call in+ uri
 * @param fusionEnv <FusionEnv> The Fusion env to get uri for
 * @param service <string> Custom service uri to use insted of Fusion
 * @param version <string> The version of the api to use
 * @returns <string> The uri with endpoint
 */
export const getEndpointUrl = async (
    endpoint: string,
    fusionEnv: FusionEnv,
    service: string,
    version: string = '1.0',
): Promise<string> => {
    const { CUSTOM_APPAPI, FUSION_CLI_ENV, FUSION_TOKEN } = process.env;

    /* use consumer provided api url */
    if (service || CUSTOM_APPAPI) {
        return service ?? CUSTOM_APPAPI;
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
                agent: new https.Agent({
                    rejectUnauthorized: false, // Allow self-signed certificates
                }),
            },
        );

        if (requestService.status === 401) {
            throw new Error(
                `The provided FUSION_TOKEN is not valid. Refresh your token and try again.`,
            );
        }

        if (!requestService.ok) {
            const response = await requestService.json();
            console.log(response);
            throw new Error(
                `Failed getEndpointUrl from service-discovery. HTTP status: ${requestService.status} - ${requestService.statusText}`,
            );
        }

        const responseService = await requestService.json();
        process.env.FUSION_CLI_APPAPI = (responseService as { uri: string }).uri;
    }

    const uri = new URL(`${process.env.FUSION_CLI_APPAPI}/${endpoint}`);
    uri.searchParams.set('api-version', version);

    /* return fresh/cached endpoint url */
    return uri.href;
};
