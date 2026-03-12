# @equinor/fusion-framework-cli-plugin-live-ai

Experimental Fusion CLI plugin that exposes a local WebSocket write server.

## Installation

```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-live-ai
```

## Configuration

```ts
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: ['@equinor/fusion-framework-cli-plugin-live-ai'],
}));
```

## Usage

```sh
fusion-framework-cli live-ai serve --port 8787
```

Options:

- `--port <number>`: WebSocket port, defaults to `8787`
- `--root <path>`: Optional explicit app root. Defaults to nearest folder containing `package.json`.
