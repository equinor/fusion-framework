---
"@equinor/fusion-framework-cli": major
---

Add plugin system for extensible CLI architecture and new framework configuration utilities.

**Plugin System:**
- Support for optional plugins via `fusion-cli.config.ts` configuration file
- Automatic plugin discovery and loading from project root or CLI package directory
- Plugin registration via package name or direct function imports
- Support for `.ts`, `.js`, and `.json` config file formats
- Multiple plugin resolution strategies for different installation methods

**New Exports:**
- `configureFramework` - Separated framework configuration from initialization for advanced use cases
- `defineFusionCli` - Type-safe utility for defining CLI plugin configurations

**Enhancements:**
- Non-interactive mode support for `create app` command with `--git-protocol`, `--cleanup`/`--no-cleanup`, and `--no-open` options
- Automatic `.env` file loading via dotenv for environment variable support
- Improved error handling and plugin resolution strategies

**Documentation:**
- Added comprehensive AI commands documentation (internal use only)
- Updated README with plugin system usage instructions

**Quick Usage:**

1. Install a plugin package:
```sh
pnpm add -D @equinor/fusion-framework-cli-plugin-ai-chat
```

2. Create `fusion-cli.config.ts` in your project root:
```typescript
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: [
    '@equinor/fusion-framework-cli-plugin-ai-chat',
    // Or use direct imports:
    // import aiChatPlugin from '@equinor/fusion-framework-cli-plugin-ai-chat';
    // plugins: [aiChatPlugin],
  ],
}));
```

3. Plugins are automatically loaded when CLI starts:
```sh
# Plugin commands are now available
ffc ai chat
```

Plugins can be registered by package name (string) or direct function imports. The config file supports `.ts`, `.js`, or `.json` formats. If no config file exists, the CLI works normally without plugins.
