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
  'X-Fusion-CLI-Name': CLINAME,
  'X-Fusion-CLI-Version': version,
  'User-Agent': `${CLINAME}/${version}`,
};

export default defaultHeaders;
