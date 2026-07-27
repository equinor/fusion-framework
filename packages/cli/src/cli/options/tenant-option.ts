import { createOption } from 'commander';

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
