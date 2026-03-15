# @equinor/fusion-framework-cli-plugin-ai-chat

Interactive AI chat plugin for the Fusion Framework CLI (`ffc`). It adds the `ffc ai chat` command, which opens a readline-based conversation with an Azure OpenAI model, grounded in Fusion documentation retrieved from an Azure Cognitive Search vector store (Retrieval-Augmented Generation).

> [!WARNING]
> **Work in progress** — API surface and behaviour may change without notice. Intended for internal testing of vector-store search capabilities; not recommended for production use.

## Who should use this

Developers and maintainers who want to ask natural-language questions about the Fusion Framework codebase from the terminal. The command augments LLM answers with context retrieved from an indexed documentation store, so responses are Fusion-specific rather than generic.

## Quick start

### Install the plugin

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-chat
```

### Register the plugin in `fusion-cli.config.ts`

```ts
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: ['@equinor/fusion-framework-cli-plugin-ai-chat'],
}));
```

### Start a chat session

```sh
ffc ai chat \
  --openai-chat-deployment gpt-4o \
  --azure-search-endpoint https://my-search.search.windows.net \
  --azure-search-index-name fusion-docs
```

All flags can also be supplied as environment variables (see [Environment variables](#environment-variables) below).

## Key concepts

### Retrieval-Augmented Generation (RAG)

Every user message triggers a similarity search against the configured Azure Cognitive Search index. The top-_k_ documents are injected into a system prompt built by `createSystemMessage`, so the LLM prioritises Fusion-specific knowledge over general training data.

### Conversation history compression

When the message history reaches **10 messages**, the oldest **5** are summarised into a single assistant message using an AI call. A hard cap (`--history-limit`, default **20**) drops the oldest non-summary messages if the history still exceeds the limit after compression.

### LangChain chain pipeline

The command constructs a `RunnableSequence` from `@langchain/core`:

1. **Format prompt** — retrieves context, builds the system message, and assembles the `ChatMessage[]` array.
2. **Chat model** — invokes the Azure OpenAI chat deployment.
3. **String output parser** — extracts the streamed text for display.

## API surface

| Export | Module | Description |
|---|---|---|
| `registerChatPlugin` | `index.ts` | Registers the `ai chat` command on a Commander program. Default export. |
| `command` | `chat.ts` | Pre-configured Commander `Command` with all AI and chat-specific options. |
| `createSystemMessage` | `system-message-template.ts` | Builds the RAG system prompt from retrieved context. |
| `version` | `version.ts` | Auto-generated package version string. |

## Command reference — `ffc ai chat`

### Options

| Flag | Default | Description |
|---|---|---|
| `--openai-api-key <key>` | — | API key for Azure OpenAI |
| `--openai-api-version <version>` | `2024-02-15-preview` | Azure OpenAI API version |
| `--openai-instance <name>` | — | Azure OpenAI instance name |
| `--openai-chat-deployment <name>` | — | Chat model deployment name (**required**) |
| `--openai-embedding-deployment <name>` | — | Embedding deployment name |
| `--azure-search-endpoint <url>` | — | Azure Cognitive Search endpoint (**required**) |
| `--azure-search-api-key <key>` | — | Azure Cognitive Search API key (**required**) |
| `--azure-search-index-name <name>` | — | Search index name (**required**) |
| `--context-limit <number>` | `5` | Maximum context documents to retrieve per message |
| `--history-limit <number>` | `20` | Maximum messages before compression kicks in |
| `--verbose` | `false` | Print retrieval diagnostics and chain execution details |

### Environment variables

Every CLI flag has an equivalent environment variable:

| Variable | Maps to |
|---|---|
| `AZURE_OPENAI_API_KEY` | `--openai-api-key` |
| `AZURE_OPENAI_API_VERSION` | `--openai-api-version` |
| `AZURE_OPENAI_INSTANCE_NAME` | `--openai-instance` |
| `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` | `--openai-chat-deployment` |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` | `--openai-embedding-deployment` |
| `AZURE_SEARCH_ENDPOINT` | `--azure-search-endpoint` |
| `AZURE_SEARCH_API_KEY` | `--azure-search-api-key` |
| `AZURE_SEARCH_INDEX_NAME` | `--azure-search-index-name` |

### Interactive commands

| Input | Effect |
|---|---|
| `clear` | Clears conversation history |
| `Ctrl+C` | Exits immediately |

## Common patterns

### Run with environment variables only

```sh
export AZURE_OPENAI_API_KEY="..."
export AZURE_OPENAI_CHAT_DEPLOYMENT_NAME="gpt-4o"
export AZURE_SEARCH_ENDPOINT="https://my-search.search.windows.net"
export AZURE_SEARCH_API_KEY="..."
export AZURE_SEARCH_INDEX_NAME="fusion-docs"

ffc ai chat
```

### Retrieve more context per query

```sh
ffc ai chat --context-limit 10
```

### Keep a longer conversation history

```sh
ffc ai chat --history-limit 50
```

### Debug retrieval and chain execution

```sh
ffc ai chat --verbose
```

## License

ISC