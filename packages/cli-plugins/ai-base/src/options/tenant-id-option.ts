import { createOption } from 'commander';

// Default Fusion AAD tenant ID (same default as the CLI's auth options)
const DEFAULT_TENANT_ID = '3aa4a235-b6e2-48d5-9195-7fcf05b459b0' as const;

/** `--tenant-id` | `FUSION_TENANT_ID` */
export const tenantIdOption = createOption('--tenant-id <id>', 'Azure AD tenant ID')
  .env('FUSION_TENANT_ID')
  .default(DEFAULT_TENANT_ID);
