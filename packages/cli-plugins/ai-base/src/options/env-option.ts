import { createOption } from 'commander';

/** `--env` | `FUSION_ENV` — Fusion environment for service discovery */
export const envOption = createOption('--env <env>', 'Fusion environment for service discovery')
  .env('FUSION_ENV')
  .default('ci');
