import { version } from '../../version.js';

const CLINAME = 'fusion-framework-cli';

/**
 * Default headers for Fusion Framework CLI requests.
 * @type {Object}
 * @property {string} 'x-fusion-cli-name' - The name of the Fusion Framework CLI.
 * @property {string} 'x-fusion-cli-version' - The version of the Fusion Framework CLI.
 * @property {string} 'user-agent' - The user agent for the Fusion Framework CLI and its current version.
 */
export const defaultHeaders = {
  'x-fusion-cli-name': CLINAME,
  'x-fusion-cli-version': version,
  'user-agent': `${CLINAME}/${version}`,
};

export default defaultHeaders;
