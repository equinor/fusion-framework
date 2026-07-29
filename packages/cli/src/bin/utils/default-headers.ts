import { version } from '../../version.js';

const CLINAME = 'fusion-framework-cli';

/**
 * Default headers for Fusion Framework CLI requests.
 * @type {Object}
 * @property {string} 'X-Fusion-CLI-Name' - The name of the Fusion Framework CLI.
 * @property {string} 'X-Fusion-CLI-Version' - The version of the Fusion Framework CLI.
 * @property {string} 'User-Agent' - The user agent for the Fusion Framework CLI and its current version.
 */
export const defaultHeaders = {
  'X-Fusion-CLI-Name': CLINAME,
  'X-Fusion-CLI-Version': version,
  'User-Agent': `${CLINAME}/${version}`,
};

export default defaultHeaders;
