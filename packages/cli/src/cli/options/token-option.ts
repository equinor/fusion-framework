import { createOption } from 'commander';

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
