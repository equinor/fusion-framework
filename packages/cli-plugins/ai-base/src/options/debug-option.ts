import { createOption } from 'commander';

/** `-d, --debug` | `RUNNER_DEBUG` — enable verbose logging */
export const debugOption = createOption('-d, --debug', 'Enable debug mode for verbose logging')
  .env('RUNNER_DEBUG')
  .default(false);
