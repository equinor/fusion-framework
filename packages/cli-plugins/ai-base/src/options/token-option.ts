import { createOption } from 'commander';

/** `--token` | `FUSION_TOKEN` — explicit bearer token */
export const tokenOption = createOption(
  '--token <token>',
  'Azure AD bearer token (skips interactive/silent MSAL auth)',
)
  .env('FUSION_TOKEN')
  .default(undefined);
