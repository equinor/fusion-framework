import { createOption } from 'commander';

const DEFAULT_MODEL_CHAT = 'gpt-5.1-chat' as const;

/** `--chat-model` | `FUSION_AI_CHAT_MODEL` */
export const chatModelOption = createOption(
  '--chat-model <name>',
  'Azure OpenAI chat model deployment name',
)
  .env('FUSION_AI_CHAT_MODEL')
  .default(DEFAULT_MODEL_CHAT);
