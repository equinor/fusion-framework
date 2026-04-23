import { type Command, createCommand, createOption } from 'commander';

import { loadFusionAIConfig, setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import {
  withOptions as withAiOptions,
  type AiOptions,
} from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

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
  .action(async function (
    this: Command,
    commandOptions: AiOptions & { config: string; dryRun: boolean },
  ) {
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

    // Resolve index name from config
    const indexName = indexConfig.name;

    if (!indexName) {
      console.error('❌ Index name is required. Set `name` in the index config.');
      process.exit(1);
    }

    // Convert Zod shape to Azure AI Search field definitions
    const schemaFields = zodToAzureFields(indexConfig.schema.shape);

    // Guard against schema fields that collide with reserved base-schema names
    const reservedFieldNames = ['id', 'content', 'content_vector', 'metadata'] as const;
    const conflictingSchemaFields = schemaFields
      .map((field) => field.name)
      .filter((name) => reservedFieldNames.includes(name as (typeof reservedFieldNames)[number]));

    if (conflictingSchemaFields.length > 0) {
      const conflicts = [...new Set(conflictingSchemaFields)].sort().join(', ');
      console.error(
        `❌ Schema fields use reserved names: ${conflicts}. Reserved field names are: ${reservedFieldNames.join(', ')}. Rename these fields in \`index.schema\`.`,
      );
      process.exit(1);
    }

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
      vectorSearch: {
        algorithms: [{ name: 'default-hnsw', kind: 'hnsw' }],
        profiles: [
          {
            name: 'default-vector-profile',
            algorithm: 'default-hnsw',
          },
        ],
      },
    };

    if (commandOptions.dryRun) {
      console.log('📋 Index schema preview (dry-run):');
      console.log(JSON.stringify(fullSchema, null, 2));
      console.log(
        `\n✅ Schema has ${baseFields.length} base fields + ${schemaFields.length} promoted fields`,
      );
      process.exit(0);
    }

    // Create or update the index via the Fusion AI proxy
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
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fullSchema),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`❌ Index creation failed (${response.status} ${response.statusText})`);
      console.error(body);
      process.exit(1);
    }

    console.log(`✅ Index "${indexName}" created/updated successfully.`);
  });

/**
 * The `ai index create` command with inherited AI base options for
 * authentication and service discovery.
 */
export const createIndexCommand: Command = withAiOptions(_command);
