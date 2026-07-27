import { createOption } from 'commander';

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
