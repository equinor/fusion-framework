import { type Command, createCommand, createOption } from 'commander';

import { loadFusionAIConfig } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { withOptions as withAiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

import type { FusionAIConfigWithIndex } from './config.js';
import { zodToAzureFields } from './utils/zod-to-azure-fields.js';
import { resolveEmbeddingDimensions } from './utils/embedding-dimensions.js';

/**
 * CLI command: `ai index create`
 *
 * Generate and preview the Azure AI Search index schema derived from the
 * Zod-based schema definition in the fusion-ai config.
 *
 * Reads the `index.schema` configuration, converts the Zod shape into
 * Azure AI Search field definitions, and combines them with the base
 * fields (`id`, `content`, `content_vector`, `metadata`) to produce
 * the full index schema.
 *
 * Usage:
 *   $ ffc ai index create [options]
 *
 * Options:
 *   --config <config>  Path to a config file (default: fusion-ai.config)
 *   --dry-run          Preview the schema without creating the index
 *
 * Examples:
 *   $ ffc ai index create --dry-run
 *   $ ffc ai index create --config fusion-ai.config.eds.ts --dry-run
 */
const _command = createCommand('create')
  .description('Create an Azure AI Search index from the config schema definition')
  .addOption(createOption('--config <config>', 'Path to a config file').default('fusion-ai.config'))
  .addOption(
    createOption('--dry-run', 'Preview the index schema without creating it').default(false),
  )
  .action(async function (this: Command, commandOptions: { config: string; dryRun: boolean }) {
    const config = await loadFusionAIConfig<FusionAIConfigWithIndex>(commandOptions.config, {
      baseDir: process.cwd(),
    });

    const indexConfig = config.index;
    if (!indexConfig?.schema) {
      console.error(
        '❌ No schema defined in config. Add a `schema` property to `index` using defineIndexSchema().',
      );
      process.exit(1);
    }

    // Resolve index name from config or CLI parent options
    const parentCommand = this.parent ?? this;
    const indexName =
      (parentCommand as Command & { opts: () => Record<string, unknown> }).opts?.().indexName ??
      indexConfig.name;

    if (!indexName) {
      console.error('❌ Index name is required. Set `name` in config or pass --index-name.');
      process.exit(1);
    }

    // Convert Zod shape to Azure AI Search field definitions
    const schemaFields = zodToAzureFields(indexConfig.schema.shape);

    // Resolve embedding vector dimensions from the model name or explicit config
    const model = indexConfig.model ?? 'text-embedding-3-large';
    let dimensions: number;
    try {
      dimensions = resolveEmbeddingDimensions(model, indexConfig.embedding?.dimensions);
    } catch (error) {
      console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }

    // Base Azure AI Search fields that every index requires
    const baseFields = [
      {
        name: 'id',
        type: 'Edm.String' as const,
        key: true,
        filterable: true,
        sortable: false,
        facetable: false,
        searchable: false,
      },
      {
        name: 'content',
        type: 'Edm.String' as const,
        filterable: false,
        sortable: false,
        facetable: false,
        searchable: true,
      },
      {
        name: 'content_vector',
        type: 'Collection(Edm.Single)' as const,
        filterable: false,
        sortable: false,
        facetable: false,
        searchable: true,
        dimensions,
        vectorSearchProfile: 'default-vector-profile',
      },
      {
        name: 'metadata',
        type: 'Edm.ComplexType' as const,
        fields: [
          {
            name: 'source',
            type: 'Edm.String' as const,
            filterable: true,
            sortable: false,
            facetable: false,
            searchable: false,
          },
          {
            name: 'attributes',
            type: 'Collection(Edm.ComplexType)' as const,
            fields: [
              {
                name: 'key',
                type: 'Edm.String' as const,
                filterable: true,
                sortable: false,
                facetable: false,
                searchable: false,
              },
              {
                name: 'value',
                type: 'Edm.String' as const,
                filterable: true,
                sortable: false,
                facetable: true,
                searchable: false,
              },
            ],
          },
        ],
      },
    ];

    const fullSchema = {
      name: indexName,
      fields: [...baseFields, ...schemaFields],
    };

    if (commandOptions.dryRun) {
      console.log('📋 Index schema preview (dry-run):');
      console.log(JSON.stringify(fullSchema, null, 2));
      console.log(
        `\n✅ Schema has ${baseFields.length} base fields + ${schemaFields.length} promoted fields`,
      );
      process.exit(0);
    }

    // TODO: Send schema to Fusion AI proxy via POST /indexes/{name}
    // Blocked by equinor/fusion-core-tasks#1009 and #1010
    console.error(
      '❌ Index creation via the proxy is not yet implemented. Use --dry-run to preview the schema.',
    );
    process.exit(1);
  });

/**
 * The `ai index create` command with inherited AI base options for
 * authentication and service discovery.
 */
export const createIndexCommand: Command = withAiOptions(_command);
