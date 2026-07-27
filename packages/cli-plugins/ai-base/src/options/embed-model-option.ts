import { createOption } from 'commander';

const DEFAULT_MODEL_EMBED = 'text-embedding-3-large' as const;

/** `--embed-model` | `FUSION_AI_EMBED_MODEL` */
export const embedModelOption = createOption(
  '--embed-model <name>',
  'Azure OpenAI embedding model deployment name',
)
  .env('FUSION_AI_EMBED_MODEL')
  .default(DEFAULT_MODEL_EMBED);
