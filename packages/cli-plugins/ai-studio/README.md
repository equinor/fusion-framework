# @equinor/fusion-framework-cli-plugin-ai-studio

Experimental local write server for Fusion Framework apps.

## Features

- WebSocket protocol for chat and change set lifecycle
- Streaming assistant token events
- Proposed file diffs before write
- Manual apply/reject flow
- Path traversal and symlink escape protection
- Optional JSONL audit logs under `.live-ai/sessions`

## Usage

```sh
pnpm fusion-live-ai --port 8787
```

Or from code:

```ts
import { startServer } from '@equinor/fusion-framework-cli-plugin-ai-studio';

const server = await startServer({ root: process.cwd(), port: 8787 });
```

## SDK HTTP Mock

Use the bundled mock HTTP server to exercise the `sdk/http` executor path locally.

Start the mock server:

```sh
pnpm sdk:mock-server
```

Then start ai-studio with SDK HTTP mode enabled:

```sh
FUSION_AI_STUDIO_EXECUTOR=sdk \
FUSION_AI_STUDIO_SDK_ADAPTER=http \
FUSION_AI_STUDIO_SDK_ENDPOINT=http://localhost:8799/sdk \
node ./dist/esm/cli.js --root /path/to/app
```
