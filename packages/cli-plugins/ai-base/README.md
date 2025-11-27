# AI Base Plugin Package

> [!DANGER]
> **⚠️ INTERNAL USE ONLY**  
> This package is published to npm but is **not intended for standalone use**. It is designed for internal use within Equinor's Fusion Framework ecosystem. External consumers should use the higher-level AI CLI plugins instead.

## Purpose

This package provides shared utilities and options that are used across multiple AI CLI plugins:
- `@equinor/fusion-framework-cli-plugin-ai-chat`
- `@equinor/fusion-framework-cli-plugin-ai-search`
- `@equinor/fusion-framework-cli-plugin-ai-index`

## Why Internal-Only?

This package is published to npm but is **not intended for standalone or external use**. It serves as a shared codebase for internal AI CLI plugins within the Fusion Framework ecosystem. While published, it's designed to be used by other Equinor packages, not as a standalone library.

> [!TIP]
> **Key points:**
> - Published to npm for internal Equinor ecosystem use
> - Not designed for standalone use - use higher-level AI CLI plugins instead
> - Serves as a shared dependency for `@equinor/fusion-framework-cli-plugin-ai-*` packages
> - Changes here affect all consuming plugins, so coordinate updates carefully

## Usage in Consuming Plugins

> [!NOTE]
> This package is intended for use by other Equinor Fusion Framework packages. External consumers should use the higher-level AI CLI plugins instead.

### 1. Install as Dependency

Add the base package to your `package.json` dependencies:

**For monorepo packages (development):**
```json
{
  "dependencies": {
    "@equinor/fusion-framework-cli-plugin-ai-base": "workspace:*"
  }
}
```

### 2. Import from Base Package

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

### 3. Build Configuration

> [!TIP]
> The consuming plugin should handle bundling appropriately. The base package can be:
> - Bundled into the consuming plugin's output (recommended for CLI tools)
> - Used as a runtime dependency (if the consuming package is also published)
>
> For CLI plugins, bundling is typically recommended to create a single executable output.

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

This package follows the standard monorepo structure:
- Source code: `src/`
- TypeScript config: `tsconfig.json`
- Build: `pnpm build` (type checking only, no bundling needed)

## Usage Guidelines

> [!WARNING]
> This package is published but intended for internal Equinor use only.
>
> - This package is published to npm as part of the Fusion Framework ecosystem
> - It is not designed for standalone use by external consumers
> - External users should use higher-level AI CLI plugins instead
> - Changesets should be created for versioning and changelog tracking
> - Breaking changes affect all consuming plugins, so coordinate updates carefully

