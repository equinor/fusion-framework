# @equinor/fusion-framework-cli

Command-line toolkit for developing, building, and publishing Fusion Framework applications and portal templates. Provides a unified developer experience from local development to production deployment.

## Features

- **Application scaffolding** — generate new Fusion apps from predefined templates
- **Development server** — hot-reload dev server with service discovery and authentication
- **Build & bundle** — Vite-based production builds with manifest generation
- **Publish & tag** — upload bundles and configs to the Fusion app/portal service
- **Snapshot versions** — timestamped preview builds for PRs and CI (`--snapshot`)
- **Portal templates** — build, bundle, and deploy portal configurations
- **Service discovery** — resolve Fusion service endpoints from any environment
- **Authentication** — Azure AD login, token management, CI/CD token support
- **Plugin system** — extend the CLI with optional plugin packages

## Installation

```sh
pnpm add -D @equinor/fusion-framework-cli
```

The package exposes two binary aliases: `fusion-framework-cli` and `ffc`.

## Usage

### Create a new application

```sh
# Interactive template selection
pnpm fusion-framework-cli app create my-app

# Use a specific template
pnpm fusion-framework-cli app create my-app --template react-app
```

### Local development

```sh
# Start the dev server (app)
pnpm fusion-framework-cli dev

# Start the dev server (portal)
pnpm fusion-framework-cli portal dev
```

### Build and publish

```sh
# Build an application
pnpm fusion-framework-cli app build

# Bundle into a zip archive
pnpm fusion-framework-cli app pack

# Publish bundle + config to an environment
pnpm fusion-framework-cli app publish --env ci --config

# Snapshot build for a PR
pnpm fusion-framework-cli app pack --snapshot pr-123
```

### Authentication

```sh
# Interactive login
pnpm fusion-framework-cli auth login

# Retrieve a token
pnpm fusion-framework-cli auth token

# CI/CD: set FUSION_TOKEN environment variable instead
```

### Command overview

| Command | Description |
|---|---|
| `app create` | Scaffold a new Fusion application from a template |
| `app build` | Build the application with Vite |
| `app pack` | Bundle the build into a zip archive |
| `app publish` | Build, pack, and upload in one step |
| `app upload` | Upload a pre-built bundle |
| `app config` | Generate or publish app configuration |
| `app tag` | Tag a published version (e.g. `latest`) |
| `app check` | Verify app registration in the app store |
| `app dev` | Start the application dev server |
| `app serve` | Preview a production build locally |
| `portal build` | Build a portal template |
| `portal pack` | Bundle the portal into a zip archive |
| `portal publish` | Build, pack, and upload a portal |
| `portal upload` | Upload a pre-built portal bundle |
| `portal config` | Generate or publish portal configuration |
| `portal tag` | Tag a published portal version |
| `portal dev` | Start the portal dev server |
| `auth login` | Authenticate with Azure AD |
| `auth logout` | Clear stored credentials |
| `auth token` | Print or acquire an access token |
| `disco resolve` | Resolve a Fusion service endpoint |

Run `pnpm fusion-framework-cli <command> --help` for detailed options.

## API Reference

The package exposes several sub-path exports for programmatic use:

### `@equinor/fusion-framework-cli` (root)

- `defineDevServerConfig` / `defineFusionCli` — type-safe config definition helpers
- `loadDevServerConfig` — load and merge dev-server configuration files
- `resolvePackage` / `resolveEntryPoint` — package and entry-point resolution
- `RuntimeEnv` — runtime environment type used across the CLI

### `@equinor/fusion-framework-cli/app`

- `defineAppManifest` / `defineAppConfig` — type-safe manifest and config helpers
- `loadAppManifest` / `loadAppConfig` — load and validate app manifest/config files
- `createAppManifestFromPackage` — generate a manifest from `package.json`
- `mergeAppManifests` / `mergeAppConfig` — deep-merge manifest/config objects
- `ApiAppConfigSchema` — Zod schema for app config validation

### `@equinor/fusion-framework-cli/portal`

- `definePortalManifest` / `definePortalConfig` / `definePortalSchema` — type-safe helpers
- `loadPortalManifest` / `loadPortalConfig` / `loadPortalSchema` — load and validate files
- `createPortalManifestFromPackage` — generate a portal manifest from `package.json`
- `validatePortalManifest` — validate a manifest against the Zod schema

### `@equinor/fusion-framework-cli/bin`

- `buildApplication` / `buildPortal` — programmatic Vite builds
- `bundleApp` / `bundlePortal` — build + pack into zip
- `uploadApplication` / `uploadPortalBundle` — upload bundles to the service
- `tagApplication` / `tagPortal` — tag published versions
- `initializeFramework` / `configureFramework` — set up the Fusion Framework for CLI operations
- `FusionEnv` — enum of supported Fusion environments

### `@equinor/fusion-framework-cli/utils`

- `assert` / `assertFileExists` / `assertObject` — assertion helpers
- `fileExists` / `fileExistsSync` — file-existence checks
- `writeFile` — write files with automatic directory creation
- `resolveAnnotations` — resolve CI/CD build annotations
- `generateSnapshotVersion` — create timestamped snapshot versions

## Configuration

### Application manifest (`app.manifest.ts`)

```ts
import { defineAppManifest } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest((env, { base }) => ({
  ...base,
  // override manifest fields here
}));
```

### Application config (`app.config.ts`)

```ts
import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig((env, { base }) => ({
  environment: { MY_VAR: 'value' },
  endpoints: {
    api: { url: 'https://api.example.com', scopes: ['api://scope/.default'] },
  },
}));
```

### Dev-server config (`dev-server.config.ts`)

```ts
import { defineDevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig((env, { base }) => ({
  ...base,
  // override dev-server options here
}));
```

### CLI plugins (`fusion-cli.config.ts`)

```ts
import { defineFusionCli } from '@equinor/fusion-framework-cli';

export default defineFusionCli(() => ({
  plugins: ['@equinor/fusion-framework-cli-plugin-ai'],
}));
```

## Documentation

- [Developing Apps](docs/application.md) — build, configure, and deploy applications
- [Developing Portals](docs/portal.md) — build and publish portal templates
- [Dev Server](docs/dev-server.md) — architecture and configuration
- [Authentication](docs/auth.md) — local and CI/CD authentication setup
- [Migration v10 → v11](docs/migration-v10-to-v11.md) — breaking changes and upgrade steps
