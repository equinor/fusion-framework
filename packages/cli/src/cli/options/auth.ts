import { type Command, InvalidOptionArgumentError } from 'commander';

import { tenantOption } from './tenant-option.js';
import { clientOption } from './client-option.js';
import { tokenOption } from './token-option.js';
import { scopeOption } from './scope-option.js';

// UUID validation regex (v4 UUID format)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Enhances a given command with authentication-related options.
 *
 * This function adds the following options to the provided command:
 * - `tenantId`: Specifies the tenant identifier.
 * - `clientId`: Specifies the client identifier.
 * - `token`: Specifies the authentication token.
 *
 * @param command - The command to which authentication options will be added.
 *
 * @example
 * ```ts
 * import { createCommand } from 'commander';
 * import { withAuthOptions } from './path/to/this/file';
 * const command = withAuthOptions(
 *   createCommand('my-command')
 *     .description('My command description')
 *     .action((options) => {
 *       console.log('tenantId:', options.tenant);
 *       console.log('clientId:', options.client);
 *       console.log('token:', options.token);
 *     })
 * );
 *
 * withAuthOptions(command);
 * ```
 **/
export const withAuthOptions = (
  command: Command,
  args?: Partial<{ excludeToken: boolean; includeScope: boolean }>,
): Command => {
  command.addOption(tenantOption);
  command.addOption(clientOption);

  // Token-based auth is opt-out; skip the option unless explicitly excluded
  if (!args?.excludeToken) {
    command.addOption(tokenOption);
  }

  // Scope is only meaningful for commands that request scoped tokens
  if (args?.includeScope) {
    command.addOption(scopeOption);
  }
  command.hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    // If token is provided, skip other validations
    if (options.token) {
      // A blank/whitespace-only token is treated as invalid input
      if (typeof options.token !== 'string' || options.token.trim() === '') {
        throw new InvalidOptionArgumentError('Token must be a non-empty string.');
      }
      // Remove tenantId, clientId, and scope by setting them to undefined
      thisCommand.setOptionValue('tenantId', undefined);
      thisCommand.setOptionValue('clientId', undefined);
      // Scope is irrelevant once a static token is supplied
      if (args?.includeScope) {
        thisCommand.setOptionValue('scope', undefined);
      }
      return;
    }

    // Validate tenantId
    if (!options.tenantId || typeof options.tenantId !== 'string') {
      throw new InvalidOptionArgumentError('Tenant ID must be a non-empty string.');
    }
    // Reject non-UUID tenant IDs even if the basic presence check passed
    if (!UUID_REGEX.test(options.tenantId)) {
      throw new InvalidOptionArgumentError('Tenant ID must be a valid UUID.');
    }

    // Validate clientId
    if (!options.clientId || typeof options.clientId !== 'string') {
      throw new InvalidOptionArgumentError('Client ID must be a non-empty string.');
    }
    // Reject non-UUID client IDs even if the basic presence check passed
    if (!UUID_REGEX.test(options.clientId)) {
      throw new InvalidOptionArgumentError('Client ID must be a valid UUID.');
    }

    // Validate scope if included
    if (args?.includeScope) {
      // Scope must be a real, non-empty list to be usable
      if (!Array.isArray(options.scope) || options.scope.length === 0) {
        throw new InvalidOptionArgumentError('Scope must be a non-empty array of strings.');
      }
      // Validate each scope entry individually
      for (const scope of options.scope) {
        // Reject blank/whitespace-only scope strings
        if (typeof scope !== 'string' || scope.trim() === '') {
          throw new InvalidOptionArgumentError('Each scope must be a non-empty string.');
        }
      }
    }
  });
  return command;
};

export default withAuthOptions;
