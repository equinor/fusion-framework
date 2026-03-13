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

Package scripts:

```sh
pnpm serve -- --root /path/to/app
pnpm serve:sdk:mock -- --root /path/to/app
pnpm serve:sdk:http -- --root /path/to/app
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
pnpm serve:sdk:http -- --root /path/to/app
```

Override the default endpoint when needed:

```sh
FUSION_AI_STUDIO_SDK_ENDPOINT=http://localhost:9000/sdk pnpm serve:sdk:http -- --root /path/to/app
```
