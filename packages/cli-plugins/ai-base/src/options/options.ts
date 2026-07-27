import { chatModelOption } from './chat-model-option.js';
import { clientIdOption } from './client-id-option.js';
import { debugOption } from './debug-option.js';
import { embedModelOption } from './embed-model-option.js';
import { envOption } from './env-option.js';
import { indexNameOption } from './index-name-option.js';
import { tenantIdOption } from './tenant-id-option.js';
import { tokenOption } from './token-option.js';

/**
 * Aggregated Commander option definitions for Fusion AI CLI commands.
 *
 * @remarks
 * Individual options are defined in their own module (one export per file)
 * and re-exported here for convenient access as a single object.
 */
export default {
  envOption,
  tokenOption,
  tenantIdOption,
  clientIdOption,
  chatModelOption,
  embedModelOption,
  indexNameOption,
  debugOption,
};
