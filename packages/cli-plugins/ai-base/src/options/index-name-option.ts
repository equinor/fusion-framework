import { createOption } from 'commander';

/** `--index-name` | `FUSION_AI_INDEX_NAME` */
export const indexNameOption = createOption(
  '--index-name <name>',
  'Azure AI Search index name',
).env('FUSION_AI_INDEX_NAME');
