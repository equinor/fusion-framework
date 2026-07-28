import { createOption } from 'commander';

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
 * Option for providing an Azure AD access token directly.
 * If set, tenant and client options are ignored.
 */
export const tokenOption = createOption(
  '--token <string>',
  'The Azure AD access token. If provided, the --tenant and --client options are ignored',
)
  .env('FUSION_TOKEN')
  .default(undefined);
