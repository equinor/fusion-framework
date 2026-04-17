> [!CAUTION]
>
> **⚠️ INTERNAL USE ONLY - NOT FOR EXTERNAL USE**
> 
> **This feature is exclusively for internal use by the Fusion Core team.**
> 
> This AI functionality is **NOT supported for third-party users** and is not part of the public API. These commands are experimental and intended only for internal development and documentation purposes within the Fusion Framework team.
> 
> **Do not use these commands if you are:**
> - A third-party developer using Fusion Framework
> - Building applications on top of Fusion Framework
> - Expecting official support or documentation for external use
> 
> For questions or issues related to these commands, contact the Fusion Core team directly.

---

The Fusion Framework CLI provides AI commands for interacting with Large Language Models (LLMs), generating document embeddings, and performing semantic search. These commands integrate with the Fusion AI service via automatic service discovery and MSAL authentication.

## Overview

The `ai` command group includes the following subcommands:

- **`ai chat`** - Interactive chat with AI models
- **`ai index add`** - Add documents to the search index by generating embeddings from source files
- **`ai index search`** - Search the vector store to validate embeddings and retrieve relevant documents
- **`ai index remove`** - Remove documents from the search index by source path or OData filter
- **`ai index embed`** - Embed a single text string and print the resulting vector (for testing)

## Prerequisites

Before using the AI commands, you need:

1. **Access to the Fusion AI service** — the CLI resolves the service endpoint automatically from Fusion service discovery.
2. **Azure AD credentials** — the CLI authenticates via MSAL. On first use it will launch an interactive browser login; subsequent runs use the cached token silently.

## Authentication

The CLI supports three authentication modes, tried in this order:

1. **Static token** (`--token` / `FUSION_TOKEN`) — bypasses MSAL entirely. Useful for CI/CD with pre-obtained tokens.
2. **Silent MSAL** — uses cached credentials from a previous interactive login.
3. **Interactive login** — if no cached credentials exist, the CLI automatically spawns `ffc auth login` (opens a browser) and retries.

### Environment variables

| Flag | Environment variable | Default | Description |
|---|---|---|---|
| `--env` | `FUSION_ENV` | `ci` | Fusion environment for service discovery |
| `--token` | `FUSION_TOKEN` | — | Explicit bearer token (skips MSAL auth) |
| `--tenant-id` | `FUSION_TENANT_ID` | Equinor tenant | Azure AD tenant ID |
| `--client-id` | `FUSION_CLIENT_ID` | Fusion default | Azure AD application client ID |
| `--chat-model` | `FUSION_AI_CHAT_MODEL` | `gpt-5.1-chat` | Azure OpenAI chat model deployment |
| `--embed-model` | `FUSION_AI_EMBED_MODEL` | `text-embedding-3-large` | Azure OpenAI embedding model deployment |
| `--index-name` | `FUSION_AI_INDEX_NAME` | — | Azure AI Search index name |

### Configuration File

For the `ai index add` command, you can create a `fusion-ai.config.ts` file in your project root to control which files are indexed and how metadata is processed:

```typescript
export default {
  index: {
    name: 'my-index',                     // Index name (overridden by --index-name)
    model: 'text-embedding-3-large',       // Embedding model (overridden by --embed-model)
    patterns: [
      'packages/**/src/**/*.{ts,tsx}',
      'packages/**/docs/**/*.md',
      'packages/**/README.md',
    ],
    metadata: {
      resolvePackage: true,                // Extract package.json metadata
      attributeProcessor: (metadata, document) => {
        // Add custom tags based on file path
        metadata.tags ??= [];
        if (document.metadata.source.includes('cookbooks/')) {
          metadata.tags.push('cookbook');
        }
        return metadata;
      },
    },
  },
};
```

## Commands

### `ai chat`

Interactive chat with Large Language Models enhanced with vector store context retrieval (RAG - Retrieval-Augmented Generation).

#### Features

- Real-time streaming responses from AI models
- Automatic context retrieval from vector store for enhanced accuracy
- Intelligent message history compression using AI summarization
- Special commands: `exit`, `quit`, `clear`, `help`
- Configurable context retrieval limits

#### Usage

```bash
ffc ai chat [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--history-limit <number>` | Max messages in conversation history | `20` |
| `--verbose` | Enable verbose output | `false` |
| `--debug` | Enable debug mode (sets `OPENAI_LOG=debug`, implies `--verbose`) | `false` |

#### Interactive Commands

While in chat mode, you can use these special commands:

- `exit` or `quit` - End the conversation
- `clear` - Clear conversation history
- `help` - Show available commands
- `Ctrl+C` - Exit immediately

#### Examples

```bash
# Start interactive chat with default settings
ffc ai chat

# Increase conversation history limit for longer sessions
ffc ai chat --history-limit 100

# Enable verbose output for debugging
ffc ai chat --verbose

# Enable full debug mode (OPENAI_LOG=debug)
ffc ai chat --debug
```

#### How It Works

1. **Message Formatting**: User messages and conversation history are sent to the chat model
2. **Streaming Response**: The AI response streams in real-time for immediate feedback
3. **History Management**: Conversation history is automatically compressed when it reaches 10 messages using AI summarisation to maintain context while reducing token usage

### `ai index add`

Add documents to the AI search index by generating embeddings from markdown and TypeScript files.

#### Features

- Markdown document chunking with frontmatter extraction
- TypeScript/TSX TSDoc extraction and chunking
- Glob pattern support for file collection
- Recursive directory processing
- Dry-run mode for testing
- Git diff-based processing for CI/CD workflows
- Automatic metadata extraction (git commit, author, etc.)

#### Usage

```bash
ffc ai index add [options] [glob-patterns...]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Show what would be processed without doing it | `false` |
| `--config <path>` | Path to config file | `fusion-ai.config.ts` |
| `--diff` | Process only changed files (workflow mode) | `false` |
| `--base-ref <ref>` | Git reference to compare against | `HEAD~1` |
| `--clean` | Delete all existing documents before processing | `false` |

#### Examples

```bash
# Dry run to see what would be processed
ffc ai index add --dry-run ./src

# Process all TypeScript and Markdown files in a directory
ffc ai index add ./src

# Process only changed files (useful for CI/CD)
ffc ai index add --diff ./src

# Process changed files compared to a specific branch
ffc ai index add --diff --base-ref origin/main ./src

# Clean and re-index all documents
ffc ai index add --clean ./src

# Process specific file patterns
ffc ai index add "packages/**/*.ts" "docs/**/*.md" "docs/**/*.mdx"

# Use custom config file
ffc ai index add --config ./custom-ai.config.ts ./src
```

#### Workflow Integration

The `--diff` flag is particularly useful for CI/CD pipelines. See the [CI/CD Integration](#cicd-integration) section for complete workflow examples.

#### File Processing

The command processes two types of files:

1. **Markdown/MDX Files** (`.md`, `.mdx`):
   - Extracts frontmatter metadata
   - Chunks content based on headers and structure
   - Preserves document hierarchy

2. **TypeScript/TSX Files** (`.ts`, `.tsx`):
   - Extracts TSDoc comments from functions, classes, and interfaces
   - Chunks large TSDoc blocks intelligently
   - Preserves code context and signatures

#### Metadata

Each document is enriched with metadata:

- `source` - File path relative to project root
- `rootPath` - Project root directory
- Git metadata (when available):
  - `commit` - Git commit hash
  - `author` - Commit author
  - `date` - Commit date
  - `message` - Commit message

### `ai index search`

Search the vector store to validate embeddings and retrieve relevant documents using semantic search.

#### Features

- Semantic search using vector embeddings
- Configurable result limits
- OData filter support for metadata-based filtering
- JSON output option for programmatic use
- Detailed result display with scores and metadata

#### Usage

```bash
ffc ai index search <query> [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `<query>` | Search query string | Required |
| `--limit <number>` | Maximum number of results | `10` |
| `--filter <expression>` | OData filter expression for metadata filtering | - |
| `--json` | Output results as JSON | `false` |
| `--raw` | Output raw metadata without normalization | `false` |
| `--verbose` | Enable verbose output | `false` |

#### Examples

```bash
# Basic search
ffc ai index search "how to use the framework"

# Limit results
ffc ai index search "authentication" --limit 5

# Filter by source file
ffc ai index search "typescript" --filter "metadata/source eq 'src/index.ts'"

# Output as JSON for programmatic use
ffc ai index search "documentation" --json

# Output raw metadata structure
ffc ai index search "documentation" --json --raw

# Enable verbose output
ffc ai index search "API reference" --verbose
```

#### OData Filter Examples

The `--filter` option accepts [Azure AI Search OData filter expressions](https://learn.microsoft.com/azure/search/search-query-odata-filter). Both `search` and `remove` support the same filter syntax.

Attributes are stored in Azure as a complex collection of `{key, value}` pairs (see [Indexed metadata](#indexed-metadata)). Use the `any()` lambda to match attribute keys and values.

```bash
# Filter by source file path (top-level field — no any() needed)
--filter "metadata/source eq 'packages/framework/src/index.ts'"

# Filter by multiple source paths
--filter "metadata/source eq 'src/a.ts' or metadata/source eq 'src/b.ts'"

# Filter by package name (attribute field — use any() lambda)
--filter "metadata/attributes/any(a: a/key eq 'pkg_name' and a/value eq '@equinor/fusion-framework')"

# Filter by document type (tsdoc or markdown)
--filter "metadata/attributes/any(a: a/key eq 'type' and a/value eq 'tsdoc')"

# Filter by custom tag
--filter "metadata/attributes/any(a: a/key eq 'tags' and a/value eq 'react')"

# Filter by TypeScript declaration kind
--filter "metadata/attributes/any(a: a/key eq 'ts_kind' and a/value eq 'InterfaceDeclaration')"

# Filter by git commit date
--filter "metadata/attributes/any(a: a/key eq 'git_commit_date' and a/value gt '2025-01-01')"
```

> **Common mistake:** Writing `metadata/attributes/pkg_name eq '...'` instead of using `any()`. Because attributes are stored as a `{key, value}` array in Azure, dot-path access does not work — you must use the lambda form shown above.

#### Output Formats

**Human-readable format** (default):
- Shows results with scores, sources, and content previews
- Truncates long content for readability
- Displays metadata in a structured format

**JSON format** (`--json`):
- Machine-readable output
- Full document content and metadata
- Suitable for piping to other tools or scripts

### `ai index remove`

Remove documents from the Azure AI Search index by source path or OData filter. Use this to remove stale, renamed, or excluded content without a full re-index.

#### Usage

```bash
ffc ai index remove [options] [source-paths...]
```

#### Options

| Option | Description | Default |
|--------|-------------|--------|
| `[source-paths...]` | One or more relative file paths to remove | - |
| `--filter <expression>` | Raw OData filter expression for advanced selection | - |
| `--dry-run` | Preview what would be removed without deleting anything | `false` |

#### Examples

```bash
# Remove by source file paths
ffc ai index remove packages/modules/old/src/index.ts packages/modules/old/README.md

# Preview what would be removed (dry-run)
ffc ai index remove --dry-run packages/modules/old/src/index.ts

# Remove all chunks from a specific package
ffc ai index remove --filter "metadata/attributes/any(a: a/key eq 'pkg_name' and a/value eq '@equinor/fusion-framework-module-old')"

# Remove all markdown documents from a package
ffc ai index remove --filter "metadata/attributes/any(a: a/key eq 'pkg_name' and a/value eq '@equinor/my-pkg') and metadata/attributes/any(a: a/key eq 'type' and a/value eq 'markdown')"

# Remove by raw source path filter
ffc ai index remove --filter "metadata/source eq 'src/deprecated-file.ts'"
```

#### How source-path arguments work

When you pass file paths as positional arguments, the command builds an OData filter that matches each path against the `metadata/source` field:

```bash
# This command:
ffc ai index remove src/a.ts src/b.ts

# Is equivalent to:
ffc ai index remove --filter "metadata/source eq 'src/a.ts' or metadata/source eq 'src/b.ts'"
```

When both source paths and `--filter` are provided, source paths take precedence to prevent accidental broad deletions.

---

## Indexed Metadata

Each indexed document has two kinds of metadata: **top-level fields** and **attributes** stored as a `{key, value}` array.

### Top-level fields

Access directly in OData filters:

| Field | Type | Description |
|-------|------|-------------|
| `metadata/source` | `string` | Relative file path (e.g. `packages/framework/src/index.ts`) |

### Attribute fields

Access via `metadata/attributes/any(a: a/key eq '...' and a/value eq '...')`:

| Key | Values / Type | Set by | Description |
|-----|---------------|--------|-------------|
| `type` | `'tsdoc'` \| `'markdown'` | Parser | Document type discriminator |
| `ts_kind` | `string` | TSDoc parser | TypeScript declaration kind (e.g. `FunctionDeclaration`, `InterfaceDeclaration`) |
| `ts_name` | `string` | TSDoc parser | Exported symbol name |
| `md_*` | `any` | Markdown parser | YAML frontmatter fields, prefixed with `md_` |
| `pkg_name` | `string` | Package resolver | `name` from the nearest `package.json` |
| `pkg_version` | `string` | Package resolver | `version` from the nearest `package.json` |
| `pkg_keywords` | `string[]` | Package resolver | `keywords` from `package.json` |
| `git_commit_hash` | `string` | Git metadata | Commit SHA of the source file |
| `git_commit_date` | `string` | Git metadata | ISO 8601 commit date |
| `git_link` | `string` | Git metadata | GitHub permalink to the file |
| `tags` | `string[]` | `attributeProcessor` | Custom tags set by `fusion-ai.config.ts` (e.g. `package`, `react`, `module`, `cookbook`) |

### Example: full document shape in Azure

```json
{
  "id": "cGFja2FnZXMvZnJhbWV3b3JrL3NyYy9pbmRleC50cw",
  "pageContent": "/** TSDoc comment... */\nfunction enableFramework() {...}",
  "metadata": {
    "source": "packages/framework/src/index.ts",
    "attributes": [
      { "key": "type", "value": "tsdoc" },
      { "key": "ts_kind", "value": "FunctionDeclaration" },
      { "key": "ts_name", "value": "enableFramework" },
      { "key": "pkg_name", "value": "@equinor/fusion-framework" },
      { "key": "pkg_version", "value": "8.1.0" },
      { "key": "git_commit_hash", "value": "abc1234" },
      { "key": "git_commit_date", "value": "2025-03-14T10:30:00Z" },
      { "key": "git_link", "value": "https://github.com/equinor/fusion-framework/blob/main/packages/framework/src/index.ts" },
      { "key": "tags", "value": "[\"package\"]" }
    ]
  }
}
```

---

## Common Workflows

### Initial Setup

1. **Authenticate** with your Equinor / Fusion identity:
   ```bash
   # Interactive device-code login (opens a browser)
   ffc ai chat
   # The CLI will prompt you to sign in on first use
   ```

2. **Create configuration file** (optional):
   ```bash
   # Create fusion-ai.config.ts in project root
   ```

3. **Generate initial embeddings**:
   ```bash
   ffc ai index add --clean ./src
   ```

4. **Verify embeddings with search**:
   ```bash
   ffc ai index search "test query"
   ```

5. **Start using chat**:
   ```bash
   ffc ai chat
   ```

### Incremental Updates

For ongoing development, use diff-based processing:

```bash
# Process only changed files
ffc ai index add --diff ./src
```

### CI/CD Integration

#### Basic Workflow

```yaml
# Example GitHub Actions workflow
name: Update AI Index

on:
  push:
    branches: [main]

jobs:
  update-embeddings:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for --diff to work

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '24'

      - run: pnpm install

      - name: Update embeddings
        run: |
          ffc ai index add --diff
        env:
          FUSION_TOKEN: ${{ secrets.FUSION_TOKEN }}
          FUSION_ENV: ${{ vars.FUSION_ENV }}
          FUSION_AI_EMBED_MODEL: ${{ vars.FUSION_AI_EMBED_MODEL }}
          FUSION_AI_INDEX_NAME: ${{ vars.FUSION_AI_INDEX_NAME }}
```

#### Advanced Workflow with SHA Tracking

For production use, track the last indexed commit SHA to enable efficient incremental updates:

```yaml
name: Index Documentation

on:
  push:
    branches: [main]

jobs:
  index-docs:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Required to commit the SHA file

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch full history for diff comparison

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Get last indexed SHA
        id: last_sha
        run: |
          if [ -f .index-base-ref ]; then
            echo "last_sha=$(cat .index-base-ref)" >> $GITHUB_OUTPUT
          else
            echo "last_sha=" >> $GITHUB_OUTPUT
          fi

      - name: Index documentation
        run: |
          if [ -n "${{ steps.last_sha.outputs.last_sha }}" ]; then
            ffc ai index add --diff --base-ref ${{ steps.last_sha.outputs.last_sha }}
          else
            ffc ai index add
          fi
        env:
          FUSION_TOKEN: ${{ secrets.FUSION_TOKEN }}
          FUSION_ENV: ${{ vars.FUSION_ENV }}
          FUSION_AI_EMBED_MODEL: ${{ vars.FUSION_AI_EMBED_MODEL }}
          FUSION_AI_INDEX_NAME: ${{ vars.FUSION_AI_INDEX_NAME }}

      - name: Save current SHA
        run: echo ${{ github.sha }} > .index-base-ref

      - name: Commit and push SHA file
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .index-base-ref
          git commit -m "Update last indexed SHA" || echo "No changes to commit"
          git push
```

**Benefits of SHA tracking:**
- Only processes files changed since the last successful indexing
- Handles cases where previous runs may have failed
- Automatically falls back to full indexing on first run
- More efficient than comparing against a fixed branch reference

**GitHub Secrets and Variables:**
- **Secrets** (Settings → Secrets and variables → Actions → Secrets): Store sensitive data
  - `FUSION_TOKEN` — a pre-obtained bearer token for the Fusion service
- **Variables** (Settings → Secrets and variables → Actions → Variables): Store non-sensitive configuration
  - `FUSION_ENV` — e.g. `ci` or `fprd`
  - `FUSION_AI_EMBED_MODEL` — embedding model deployment name
  - `FUSION_AI_INDEX_NAME` — target search index name

## Troubleshooting

### Common Issues

**Error: "Authentication failed"**
- Ensure you have a valid Equinor identity and can sign in via the browser
- If using `--token`, verify the token is still valid (tokens expire)
- For CI/CD, verify `FUSION_TOKEN` is set in GitHub Secrets

**Error: "Index name is required"**
- Pass `--index-name <name>` or set `FUSION_AI_INDEX_NAME`
- Verify the index exists in the Fusion AI Search service

**No results from search**
- Verify embeddings have been generated: `ffc ai index add --dry-run ./src`
- Check that the index contains documents
- Try a broader search query

**Embeddings command processes no files**
- Check file patterns in config or command arguments
- Verify files match the patterns (use `--dry-run` to debug)
- Ensure files are not ignored by `.gitignore`

### Debug Mode

Use the `--debug` flag for detailed output:

```bash
ffc ai chat --debug
ffc ai index search "query" --debug
```

## Best Practices

1. **Use `--token` or `FUSION_TOKEN` in CI/CD** to avoid interactive auth
2. **Start with `--dry-run`** when testing new configurations
3. **Use `--diff` in CI/CD** to only process changed files
4. **Regular re-indexing** with `--clean` to keep index fresh
5. **Monitor token usage** — embeddings and chat consume API tokens
6. **Test search queries** before relying on chat context retrieval
7. **Keep configuration files** in version control (without secrets)

## Additional Resources

- [Fusion Framework Documentation](https://github.com/equinor/fusion-framework)
- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
- [Azure AI Search Documentation](https://learn.microsoft.com/azure/search/)

