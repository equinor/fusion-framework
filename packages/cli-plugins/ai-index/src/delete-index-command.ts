import { type Command, createCommand, createOption } from 'commander';

import { loadFusionAIConfig, setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import {
  withOptions as withAiOptions,
  type AiOptions,
} from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

import type { FusionAIConfigWithIndex } from './config.js';

/**
 * CLI command: `ai index delete`
 *
 * Permanently deletes an Azure AI Search index and all its documents.
 *
 * This operation is irreversible — once deleted, the index definition and all
 * indexed documents are permanently removed. Requires `Fusion.AI.Search.Manage`
 * with a matching `index-name` scope, or the `Fusion.AI.Admin` role.
 *
 * Usage:
 *   $ ffc ai index delete [options]
 *
 * Options:
 *   --name <name>      Index name to delete (overrides config)
 *   --config <config>  Path to a config file (default: fusion-ai.config)
 *   --yes              Skip the confirmation prompt
 *
 * Examples:
 *   $ ffc ai index delete
 *   $ ffc ai index delete --name my-index --yes
 *   $ ffc ai index delete --config fusion-ai.config.eds.ts
 */
const _command = createCommand('delete')
  .description('Permanently delete an Azure AI Search index and all its documents')
  .addOption(createOption('--name <name>', 'Index name to delete (overrides config)'))
  .addOption(createOption('--config <config>', 'Path to a config file').default('fusion-ai.config'))
  .addOption(createOption('--yes', 'Skip the confirmation prompt').default(false))
  .hook('preAction', async (thisCommand) => {
    const opts = thisCommand.opts();
    const config = await loadFusionAIConfig<FusionAIConfigWithIndex>(
      (opts.config as string) ?? 'fusion-ai.config',
      { baseDir: process.cwd() },
    );
    const indexConfig = config.index ?? {};

    // --name flag takes priority, then fall back to config
    if (!opts.name?.trim() && indexConfig.name) {
      thisCommand.setOptionValue('name', indexConfig.name);
    }
  })
  .action(async function (
    this: Command,
    commandOptions: AiOptions & { config: string; yes: boolean; name?: string },
  ) {
    const indexName = commandOptions.name?.trim();

    if (!indexName) {
      console.error('❌ Index name is required. Set `name` in the index config or pass --name.');
      process.exit(1);
    }

    console.log(`\n🗑️  Target index: ${indexName}`);

    // Guard against accidental deletion — require explicit confirmation
    if (!commandOptions.yes) {
      const { createInterface } = await import('node:readline');
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise<string>((resolve) => {
        rl.question(
          `\n⚠️  This will permanently delete index "${indexName}" and ALL its documents.\n   Type the index name to confirm: `,
          resolve,
        );
      });
      rl.close();

      if (answer.trim() !== indexName) {
        console.log('❌ Confirmation did not match. Aborting.');
        process.exit(1);
      }
    }

    const framework = await setupFramework(commandOptions);
    const service = await framework.serviceDiscovery.resolveService('ai');
    const baseUri = service.uri.replace(/\/+$/, '');
    const scopes = service.scopes ?? service.defaultScopes ?? [];
    const token = await framework.auth.acquireAccessToken({ request: { scopes } });

    if (!token) {
      console.error('❌ Failed to acquire access token for the AI service.');
      process.exit(1);
    }

    const url = `${baseUri}/indexes/${encodeURIComponent(indexName)}?api-version=2024-07-01`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 204 No Content = successful deletion, 404 = index doesn't exist
    if (response.status === 404) {
      console.error(`❌ Index "${indexName}" not found.`);
      process.exit(1);
    }

    if (!response.ok) {
      const body = await response.text();
      console.error(`❌ Index deletion failed (${response.status} ${response.statusText})`);
      console.error(body);
      process.exit(1);
    }

    console.log(`✅ Index "${indexName}" deleted successfully.`);
  });

/**
 * The `ai index delete` command with inherited AI base options for
 * authentication and service discovery.
 */
export const deleteIndexCommand: Command = withAiOptions(_command);
