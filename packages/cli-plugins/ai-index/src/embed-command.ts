import { createCommand } from 'commander';

import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import {
  withOptions as withAiOptions,
  type AiOptions,
} from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

type CommandOptions = AiOptions;

/**
 * CLI command: `ai index embed <text>`
 *
 * Embeds a single text string and prints the resulting vector.
 * Useful for verifying the embeddings endpoint and model are reachable.
 *
 * @example
 * ```sh
 * ffc ai index embed "hello world"
 * ```
 */
export const embedCommand = withAiOptions(
  createCommand('embed')
    .description('Embed a text string and print the resulting vector (for testing)')
    .argument('<text>', 'Text to embed')
    .action(async (text: string, options: CommandOptions) => {
      const framework = await setupFramework(options);
      const embedder = framework.ai.useEmbed(options.embedModel);

      console.log(`Embedding model: ${options.embedModel ?? 'default'}`);
      console.log(`Input: ${JSON.stringify(text)}`);

      const vector = await embedder.embedQuery(text);

      console.log(`Dimensions: ${vector.length}`);
      console.log(
        `Vector (first 8): [${vector
          .slice(0, 8)
          .map((v) => v.toFixed(6))
          .join(', ')}, ...]`,
      );
    }),
  { includeEmbedding: true },
);
