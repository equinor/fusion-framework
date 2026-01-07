# AI Base Plugin Package

> [!DANGER]
> **⚠️ INTERNAL USE ONLY**  
> This package provides shared utilities and options for AI CLI plugins within Equinor's Fusion Framework ecosystem. External consumers should use the higher-level AI CLI plugins instead.

## Purpose

Provides common functionality for AI CLI plugins to avoid code duplication:
- Shared AI command options (model, temperature, tokens, etc.)
- Fusion Framework setup with AI module configuration
- Configuration file loading and validation
- Type definitions for AI options and configuration

Used by:
- `@equinor/fusion-framework-cli-plugin-ai-chat`
- `@equinor/fusion-framework-cli-plugin-ai-search`
- `@equinor/fusion-framework-cli-plugin-ai-index`

Changes here affect all consuming plugins, so coordinate updates carefully.

## Usage in Consuming Plugins

### Install as Dependency

**For monorepo packages:**
```json
{
  "dependencies": {
    "@equinor/fusion-framework-cli-plugin-ai-base": "workspace:*"
  }
}
```

### Import from Base Package

```typescript
// Import AI options from command-options export
import { withOptions, type AiOptions, AiOptionsSchema } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

// Import framework utilities from main export
import { setupFramework, registerAiPlugin, loadFusionAIConfig } from '@equinor/fusion-framework-cli-plugin-ai-base';

// Or import everything from main export
import { 
  setupFramework, 
  registerAiPlugin, 
  loadFusionAIConfig,
  type FrameworkInstance,
  type FusionAIConfig 
} from '@equinor/fusion-framework-cli-plugin-ai-base';
```

## Exports

- `./command-options` - AI command options, validation schemas, and option helpers
  - `withOptions` - Function to add AI options to a Commander command
  - `options` - Default export containing all option definitions
  - `AiOptionsSchema` - Zod schema for validating AI options
  - `AiOptionsType` - Type inferred from the schema
  - `AiOptions` - TypeScript interface for AI options
- `.` - Main export containing:
  - `setupFramework` - Initialize and configure Fusion Framework with AI module
  - `registerAiPlugin` - Register AI plugin commands with CLI program
  - `loadFusionAIConfig` - Load Fusion AI configuration from file
  - `configureFusionAI` - Configuration factory function
  - `FrameworkInstance` - Type for initialized framework instance
  - `FusionAIConfig` - Base configuration interface
  - `LoadFusionAIConfigOptions` - Options for loading configuration

## Development

- Build: `pnpm build` (type checking only, no bundling needed)
- Changesets should be created for versioning and changelog tracking
- Breaking changes affect all consuming plugins, so coordinate updates carefully

