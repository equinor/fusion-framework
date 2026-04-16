import { createOption } from 'commander';

// Default Fusion AAD identifiers (same defaults as the CLI's auth options)
const DEFAULT_TENANT_ID = '3aa4a235-b6e2-48d5-9195-7fcf05b459b0' as const;
const DEFAULT_CLIENT_ID = 'a318b8e1-0295-4e17-98d5-35f67dfeba14' as const;
const DEFAULT_MODEL_CHAT = 'gpt-5.1-chat' as const;
const DEFAULT_MODEL_EMBED = 'text-embedding-3-large' as const;

/** `--env` | `FUSION_ENV` — Fusion environment for service discovery */
export const envOption = createOption('--env <env>', 'Fusion environment for service discovery')
  .env('FUSION_ENV')
  .default('ci');

/** `--token` | `FUSION_TOKEN` — explicit bearer token */
export const tokenOption = createOption(
  '--token <token>',
  'Azure AD bearer token (skips interactive/silent MSAL auth)',
)
  .env('FUSION_TOKEN')
  .default(undefined);

/** `--tenant-id` | `FUSION_TENANT_ID` */
export const tenantIdOption = createOption('--tenant-id <id>', 'Azure AD tenant ID')
  .env('FUSION_TENANT_ID')
  .default(DEFAULT_TENANT_ID);

/** `--client-id` | `FUSION_CLIENT_ID` */
export const clientIdOption = createOption('--client-id <id>', 'Azure AD application client ID')
  .env('FUSION_CLIENT_ID')
  .default(DEFAULT_CLIENT_ID);

/** `--chat-model` | `FUSION_AI_CHAT_MODEL` */
export const chatModelOption = createOption(
  '--chat-model <name>',
  'Azure OpenAI chat model deployment name',
)
  .env('FUSION_AI_CHAT_MODEL')
  .default(DEFAULT_MODEL_CHAT);

/** `--embed-model` | `FUSION_AI_EMBED_MODEL` */
export const embedModelOption = createOption(
  '--embed-model <name>',
  'Azure OpenAI embedding model deployment name',
)
  .env('FUSION_AI_EMBED_MODEL')
  .default(DEFAULT_MODEL_EMBED);

/** `--index-name` | `FUSION_AI_INDEX_NAME` */
export const indexNameOption = createOption(
  '--index-name <name>',
  'Azure AI Search index name',
).env('FUSION_AI_INDEX_NAME');

export default {
  envOption,
  tokenOption,
  tenantIdOption,
  clientIdOption,
  chatModelOption,
  embedModelOption,
  indexNameOption,
};

