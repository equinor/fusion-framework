import { createOption } from 'commander';

// Default Fusion AAD client ID (same default as the CLI's auth options)
const DEFAULT_CLIENT_ID = 'a318b8e1-0295-4e17-98d5-35f67dfeba14' as const;

/** `--client-id` | `FUSION_CLIENT_ID` */
export const clientIdOption = createOption('--client-id <id>', 'Azure AD application client ID')
  .env('FUSION_CLIENT_ID')
  .default(DEFAULT_CLIENT_ID);
