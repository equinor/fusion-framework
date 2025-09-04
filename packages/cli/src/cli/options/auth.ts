import { type Command, createOption, InvalidOptionArgumentError } from 'commander';

// UUID validation regex (v4 UUID format)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Option for specifying the Azure Active Directory tenant ID.
 * Defaults to Equinor's Fusion tenant if not provided.
 */
export const tenantOption = createOption(
  '--tenantId <string>',
  'The Azure Active Directory tenant ID',
)
  .env('FUSION_TENANT_ID')
  .default('3aa4a235-b6e2-48d5-9195-7fcf05b459b0');

/**
 * Option for specifying the Azure AD application client ID.
 * Defaults to the Fusion CLI client if not provided.
 */
export const clientOption = createOption(
  '--clientId <string>',
  'The client ID of the application registered in Azure AD',
)
  .env('FUSION_CLIENT_ID')
  .default('a318b8e1-0295-4e17-98d5-35f67dfeba14');

/**
 * Option for providing an Azure AD access token directly.
 * If set, tenant and client options are ignored.
 */
export const tokenOption = createOption(
  '--token <string>',
  'The Azure AD access token. If provided, the --tenant and --client options are ignored',
)
  .env('FUSION_TOKEN')
  .default(undefined);

/**
 * Option for specifying Azure audience scopes.
 * Defaults to Fusion API scope with /.default.
 */
export const scopeOption = createOption(
  '--scope <scopes...>',
  'Azure audience scope, normally the application ID URI of the API you want to access and `.default`',
)
  .env('FUSION_AUTH_SCOPE')
  .default(['5a842df8-3238-415d-b168-9f16a6a6031b/.default']);

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

  if (!args?.excludeToken) {
    command.addOption(tokenOption);
  }

  if (args?.includeScope) {
    command.addOption(scopeOption);
  }
  command.hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    // If token is provided, skip other validations
    if (options.token) {
      if (typeof options.token !== 'string' || options.token.trim() === '') {
        throw new InvalidOptionArgumentError('Token must be a non-empty string.');
      }
      // Remove tenantId, clientId, and scope by setting them to undefined
      thisCommand.setOptionValue('tenantId', undefined);
      thisCommand.setOptionValue('clientId', undefined);
      if (args?.includeScope) {
        thisCommand.setOptionValue('scope', undefined);
      }
      return;
    }

    // Validate tenantId
    if (!options.tenantId || typeof options.tenantId !== 'string') {
      throw new InvalidOptionArgumentError('Tenant ID must be a non-empty string.');
    }
    if (!UUID_REGEX.test(options.tenantId)) {
      throw new InvalidOptionArgumentError('Tenant ID must be a valid UUID.');
    }

    // Validate clientId
    if (!options.clientId || typeof options.clientId !== 'string') {
      throw new InvalidOptionArgumentError('Client ID must be a non-empty string.');
    }
    if (!UUID_REGEX.test(options.clientId)) {
      throw new InvalidOptionArgumentError('Client ID must be a valid UUID.');
    }

    // Validate scope if included
    if (args?.includeScope) {
      if (!Array.isArray(options.scope) || options.scope.length === 0) {
        throw new InvalidOptionArgumentError('Scope must be a non-empty array of strings.');
      }
      for (const scope of options.scope) {
        if (typeof scope !== 'string' || scope.trim() === '') {
          throw new InvalidOptionArgumentError('Each scope must be a non-empty string.');
        }
      }
    }
  });
  return command;
};

export default withAuthOptions;
