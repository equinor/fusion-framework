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
