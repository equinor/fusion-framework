import { type ClientRequest } from 'http';
import { Spinner } from './spinner.js';
import { formatPath, chalk } from './format.js';

/**
 * Logs the status of a proxy request using a spinner.
 *
 * @param proxyReq - The proxy request to log.
 *
 * The function attaches event listeners to the proxy request to handle
 * 'response' and 'error' events. It uses a spinner to indicate the status
 * of the request:
 * - On a successful response (status code < 400), the spinner succeeds.
 * - On a response with a status code >= 400, the spinner warns with the status message.
 * - On an error, the spinner fails.
 */
export const proxyRequestLogger = (proxyReq: ClientRequest) => {
    const spinner = Spinner.Clone();
    spinner.ora.suffixText = formatPath(
        [proxyReq.protocol, '//', proxyReq.host, proxyReq.path].join(''),
    );
    spinner.start('proxy request');
    proxyReq.on('response', (res) => {
        if (Number(res.statusCode) < 400) {
            spinner.succeed();
        } else {
            spinner.warn(chalk.yellow(res.statusMessage ?? `${res.statusCode} `));
        }
        spinner.stop();
    });
    proxyReq.on('error', () => {
        spinner.fail();
    });
};

export default proxyRequestLogger;
