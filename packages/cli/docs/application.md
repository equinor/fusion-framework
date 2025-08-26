---
title: Developing Apps with Fusion Framework CLI
description: >
  In-depth guide to building, configuring, and deploying applications using the Fusion Framework CLI. Includes setup, essential commands, configuration files, CI/CD best practices, troubleshooting, and advanced tips for modern app development.
category: cli
related:
  - ./auth.md
  - ./migration-v10-to-v11.md
tags:
  - getting-started
  - app-development
  - configuration
  - deployment
  - ci-cd
  - commands
  - troubleshooting
  - release-management
  - automation
  - best-practices
  - migration
keywords:
  - fusion-framework-cli upload
  - fusion-framework-cli publish
  - fusion-framework-cli tag
  - fusion-framework-cli config
  - fusion-framework-cli build
  - fusion-framework-cli pack
  - fusion-framework-cli check
  - fusion-framework-cli manifest
  - fusion-framework-cli troubleshooting
  - fusion-framework-cli deployment
  - fusion-framework-cli ci-cd
  - fusion app upload
  - fusion app publish
  - fusion app tag
  - fusion app config
  - fusion app build
  - fusion app pack
  - fusion app check
  - fusion app manifest
  - fusion app troubleshooting
  - fusion app deployment
  - fusion app ci-cd
  - fusion cli command reference
  - fusion cli options
  - fusion cli arguments
---

# Fusion Framework CLI: Application Development Guide

> **Table of Contents**
> - [Getting Started](#getting-started)
> - [Prerequisites](#prerequisites)
> - [Troubleshooting & FAQ](#troubleshooting--faq)
> - [Configuration](#configuration)
> - [CI/CD Best Practices](#cicd)
> - [Command Reference](#commands)
> - [Migration & Deprecated Commands](#aliases)

---

The Fusion Framework CLI empowers you to rapidly build, configure, and deploy modern applications with ease. Whether you’re starting a new project or maintaining an existing app, this CLI streamlines your workflow—from local development to production deployment.

This guide will help you get set up, understand the most important commands, and follow best practices for configuration and CI/CD. Let’s get started building robust, scalable apps with Fusion Framework!

## Getting Started

### 1. Install the CLI

```sh
pnpm add -D @equinor/fusion-framework-cli
# or
npm install --save-dev @equinor/fusion-framework-cli
```

### 2. Scaffold a New App (if supported)

> **Tip:** If you have a template or starter, clone it. Otherwise, create a new directory and initialize your project as below.

```sh
mkdir my-fusion-app && cd my-fusion-app
pnpm init
```

### 3. Create Required Files

#### Minimal `package.json` Example

```json
{
  "name": "@equinor/fusion-framework-app",
  "version": "0.0.0",
  "description": "Fusion Framework App",
  "main": "dist/index.js",
  "files": [
    "dist/"
  ]
}
```

> **Build Output Configuration:**
> The CLI uses the `main` field (or `module` field) in your `package.json` to determine where to output the built application bundle. If neither field is specified, it defaults to `./dist/bundle.js`. 
> 
> **Why this approach?** Using the `main`/`module` fields ensures your package works correctly when served directly or when developing portals with internal references. This follows Node.js package conventions and enables proper module resolution.
> 
> **Important:** The output directory cannot be the project root, the `src` directory, or the current working directory. Always specify a dedicated build directory like `dist/`, `build/`, or similar.
>
> **Examples:**
> - `"main": "dist/index.js"` → outputs to `dist/index.js`
> - `"module": "build/app.esm.js"` → outputs to `build/app.esm.js`
> - No `main`/`module` specified → defaults to `dist/bundle.js`

#### Example `app.manifest.ts`

```ts
import { defineAppManifest } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest(async (env, { base }) => ({
  ...base,
  name: 'My Fusion App',
  version: '0.0.1',
  // Add more manifest fields as needed
}));
```

#### Example `app.config.ts`

```ts
import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig((env, args) => ({
  environment: {
    featureFlag: env === 'dev', // Example: enable feature in dev
    logLevel: 'info',
    customSetting: process.env.CUSTOM_SETTING || 'default-value',
  },
  endpoints: {
    // Define endpoints here if needed, or leave empty
  },
}));
```

### 4. Start the Development Server

```sh
pnpm fusion-framework-cli dev
```

### 5. Log in to Fusion Framework (if needed)

```sh
pnpm fusion-framework-cli auth login
```

### 6. Build, Publish, and Upload Config

```sh
pnpm fusion-framework-cli publish --env <environment>
pnpm fusion-framework-cli app config --publish --env <environment>
```

> **Tip:** For CI/CD and automation, set the `FUSION_TOKEN` environment variable. See [Authentication](./docs/auth.md) for details.

---

## Prerequisites

### For Development
- **Node.js** (LTS recommended)
- **pnpm** (or npm/yarn)
- A Fusion Framework app template or an existing project

### For Deployment
- Your application team must have registered an app in the Fusion Application Service (App Admin)
- A service principal must be set up for deployment and publishing

---

## Troubleshooting & FAQ

- **Node.js version error:** Ensure you are using a supported Node.js version (LTS recommended).
- **Authentication issues:** Make sure you are logged in and have the correct permissions for publishing. Use `pnpm fusion-framework-cli auth login`.
- **Missing manifest/config:** Ensure `app.manifest.ts` and `app.config.ts` exist in your project root.
- **Environment variables:** Use `.env` files or your CI/CD system to inject secrets and config values.
- **Command help:** Run any command with `--help` for detailed usage and options.
- **Still stuck?** See [Troubleshooting](#troubleshooting--faq) or [Authentication](./docs/auth.md).

---

## Configuration

Fusion Framework apps are configured using two main files:

- **Application Manifest (`app.manifest.ts`)**: Defines your app's metadata, capabilities, and integration points. Supports environment-specific variants (e.g., `app.manifest.dev.ts`).
- **Application Config (`app.config.ts`)**: Contains runtime configuration, such as environment variables and endpoints. Also supports environment-specific files (e.g., `app.config.dev.ts`).

These files allow you to tailor your app for different environments and deployment scenarios. See the sections below for details and examples.

### Application Manifest

> [!IMPORTANT]
> The application manifest is bundled with your app during the build process. It should only be generated or referenced as part of the build step in your CI/CD pipeline. The environment-specific variants (e.g., `app.manifest.dev.ts`) are for convenience—useful for local development or testing different configurations, but only the manifest present at build time is included in the final bundle.

> [!TIP]
> If no environment-specific file is found, `app.manifest.ts` is used as a fallback.
> For environment-specific setup, add files like `app.manifest.dev.ts` for development or `app.manifest.ci.ts` for CI environments.

Create an `app.manifest.ts` file to define your app's manifest. This file describes your app's metadata and configuration:

> [!IMPORTANT]
> The function passed to `defineAppManifest` should either:
> - Return a new manifest object, **or**
> - Return `void` after mutating the provided `base` manifest (which is generated from your `package.json` and environment).
>
> Mutating the `base` manifest is useful if you want to extend or override values from your package metadata or environment, while returning a new object allows you to fully customize the manifest.

```ts
import { defineAppManifest } from '@equinor/fusion-framework-cli/app';

export default defineAppManifest(async (env, { base }) => ({
  // You can mutate the base object and return void,
  // or return a new manifest object.
}));
```

> [!NOTE]
> The CLI will only include the first matching manifest file based on the environment (e.g., `app.manifest.dev.ts`). It will not merge multiple files. If you need to combine settings from different files, you must handle the merging logic yourself within your manifest or config code. You can use the provided `mergeAppManifest` utility from the CLI package to help merge manifest objects when needed.

### Application Config

> [!TIP]
> If no environment-specific file is found, `app.config.ts` is used as a fallback.
> For environment-specific setup, add files like `app.config.dev.ts` for development or `app.config.ci.ts` for CI environments.

Create an `app.config.ts` file to define your app's configuration. This file can export a function or object with your app's runtime configuration:

```ts
import { defineAppConfig, mergeAppManifests } from '@equinor/fusion-framework-cli/app';
import createBaseConfig from './app.config';

export default defineAppConfig((env, args) => {
  const base = createBaseConfig(env, args);
  return mergeAppManifests(base, {
    environment: {
      someAttr: 'some value',
    },
    endpoints: {
      'my-end-point': {
        url: 'https://my-api.com',
        scopes: ['https://my-api.com'],
      },
    },
  });
});
```

> [!NOTE]
> The CLI will only include the first matching config file for the environment (e.g., `app.config.dev.ts`). It will not merge `app.config.ts` and `app.config.dev.ts` automatically. If you want to combine base and environment-specific settings, you must implement the merging logic yourself in your configuration code. The CLI provides utilities such as `mergeAppManifests` to assist with merging configuration objects.

---

## CI/CD

Continuous Integration and Continuous Deployment (CI/CD) automate the process of building, testing, and deploying your application. By integrating CI/CD pipelines, you ensure that code changes are validated and delivered to your environments efficiently and reliably. This section outlines how to set up CI/CD workflows for Fusion Framework apps.

### Best Practice: Build Once, Deploy Many

A recommended approach for CI/CD with Fusion Framework apps is to build your application once and reuse the generated artifact for deployments to multiple environments. This ensures consistency across environments and speeds up your pipeline by avoiding redundant builds.

**Workflow Overview:**

1. **Build Stage:**  
  Build and bundle your application a single time. Upload the resulting artifact (e.g., `app-bundle.zip`) as a pipeline artifact.

2. **Deploy Stage (Matrix):**  
  Use a matrix strategy to deploy the same artifact to multiple environments (such as `ci`, `fqa`, `fprd`). For each environment, generate and upload the appropriate configuration using environment-specific variables or secrets.

This pattern minimizes discrepancies between environments and leverages CI/CD efficiency by separating build and deploy concerns.

### Example CI/CD Workflow

Below is an example workflow that demonstrates the recommended "build once, deploy many" pattern for Fusion Framework apps. This workflow assumes you are familiar with setting up Node.js and managing pipeline artifacts in your CI/CD system.

```yml
jobs:
  build:
   steps:
    - name: Setup node
    - name: Bundle application
      id: bundle
      working-directory: ${{ env.working-directory }}
      run: pnpm exec fusion-framework-cli app pack
    - name: Upload artifact
  deploy:
    environment: ${{ matrix.env }} # use deployment environments
    strategy:
      max-parallel: 1
      matrix:
        env: ['ci', 'fqa', 'fprd'] # Fusion Environments
    steps:
      - name: Setup node
      - name: Download Artifact
      - name: Set Fusion token
      - name: Publish application
        run: pnpm exec fusion-framework-cli app upload --env ${{ matrix.env }} app-bundle.zip
      - step: Upload configuration
        run: pnpm exec fusion-framework-cli app config --publish --env ${{ matrix.env }}
```

> [!TIP]
> see [setting-the-fusion-token-in-github](./auth.md#setting-the-fusion-token-in-github) for adding `FUSION_TOKEN` to your envirnoment


### Example: Using Environment Variables in App Config

You can use environment variables in your app configuration to inject secrets or environment-specific values at build or deploy time. For example, to access values provided by your CI/CD pipeline:

```yml
step: Upload configuration
run: pnpm exec fusion-framework-cli app config --publish --env ${{ matrix.env }}
with:
  CONFIG_VALUE_FOO: ${{ VAR.ENVIRONMENT_CONFIG_VALUE }}
  CONFIG_VALUE_BAR: ${{ SECRETS.ENVIRONMENT_CONFIG_SECRET_VALUE }}
```

```ts
import { defineAppConfig, mergeAppManifests } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig((env, args) => {
  return mergeAppManifests(args.base, {
    environment: {
      foo: process.env.CONFIG_VALUE_FOO,
      bar: process.env.CONFIG_VALUE_BAR,
    },
  });
});
```

> [!NOTE]
> if not `app.config.${{ENV}}.ts|js|json` is found it will fallback to `app.config.ts|js|json`

---

## Commands

## Command Overview

The Fusion Framework CLI provides a suite of commands to support the full application lifecycle, from development to deployment. Below is an overview of all available commands with quick links to their detailed usage:

- [Dev](#dev) — Start the development server with hot reloading.
- [Publish](#publish) — Build, upload, and tag your app for deployment.
- [Config](#config) — Generate or upload your app configuration.
- [Build](#build) — Build your application and generate deployment artifacts.
- [Pack](#pack) — Bundle your app into a distributable archive.
- [Upload](#upload) — Upload your app bundle to the Fusion app store.
- [Tag](#tag) — Tag a published app version for release management.
- [Manifest](#manifest) — Generate your app manifest file.
- [Check](#check) — Verify your app's registration status.
- [Aliases](#aliases) — Deprecated commands and their replacements.

Refer to each section below for detailed options, usage, and examples.

### Dev

Start your application in development mode with hot reloading and environment-specific configuration.

| Option              | Description                                                         | Default / Example |
| ------------------- | ------------------------------------------------------------------- | ----------------- |
| `--debug`           | Enable debug mode for verbose logging.                              | `false`           |
| `--manifest <path>` | Path to the app manifest file (`app.manifest[.env]?.[ts,js,json]`). | `app.manifest.ts` |
| `--config <path>`   | Path to the app config file (`app.config[.env]?.[ts,js,json]`).     | `app.config.ts`   |
| `--env <env>`       | Runtime environment for the dev server.                             | `local`           |
| `--port <port>`     | Port for the development server.                                    | `3000`            |

**Usage:**
```sh
pnpm fusion-framework-cli dev [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli dev
pnpm fusion-framework-cli dev --port 4000
pnpm fusion-framework-cli dev --manifest ./app.manifest.local.ts --config ./app.config.ts
```

> **Tip:** Use `--debug` to get detailed logs for troubleshooting during development.

### Publish

Publish your application to the Fusion app store (registry) for deployment.

Publish your application to the Fusion app store (registry) for deployment. This command will build (if needed), upload, and tag your app in a single step.

| Option/Argument    | Description                                                                                         | Default / Example |
| ------------------ | --------------------------------------------------------------------------------------------------- | ----------------- |
| `[bundle]`         | Path to the app bundle to upload. If omitted, the CLI will build and bundle your app automatically. |                   |
| `-e`, `--env`      | Target environment for deployment (e.g., `ci`, `fqa`, `fprd`).                                      |                   |
| `-m`, `--manifest` | Manifest file to use for bundling (e.g., `app.manifest.ts`) (optional).                             | `app.manifest.ts` |
| `-t`, `--tag`      | Tag to apply to the published app (`latest` \| `preview`).                                          | `latest`          |
| `-d`, `--debug`    | Enable debug mode for verbose logging.                                                              | `false`           |
| `--token`          | Authentication token for Fusion.                                                                    |                   |
| `--tenantId`       | Azure tenant ID for authentication.                                                                 |                   |
| `--clientId`       | Azure client ID for authentication.                                                                 |                   |

**Usage:**
```sh
pnpm fusion-framework-cli publish [bundle] [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli publish
pnpm fusion-framework-cli publish --env prod --manifest app.manifest.prod.ts
pnpm fusion-framework-cli publish --tag latest app-bundle.zip
```

> [!NOTE]
> - If you provide a bundle file, it will be uploaded directly. If not, the CLI will build and bundle your app before uploading.
> - The `--tag` option lets you mark the published version (e.g., as `latest` or `preview`) for easier deployment targeting.
> - Authentication options (`--token`, `--tenantId`, `--clientId`) can be set via CLI flags or environment variables.
> - If any step fails (build, upload, or tagging), an error will be logged and the process will exit with a non-zero code.

### Config

Upload your application configuration to the Fusion app store (registry).

Upload or generate your application configuration for the Fusion app registry.

The `config` command allows you to generate your app's configuration and either output it locally (to stdout or a file) or publish it directly to the Fusion app registry for a specific environment.

| Option/Argument     | Description                                                          | Default / Example |
| ------------------- | -------------------------------------------------------------------- | ----------------- |
| `[config]`          | Config build file to use (e.g., `app.config[.env]?.[ts,js,json]`).   | `app.config.ts`   |
| `-e`, `--env <env>` | Target environment for the configuration.                            |                   |
| `-o`, `--output`    | Output to `stdout` or a file path. Ignored with `--publish`.         | `stdout`          |
| `--publish`         | Publish the generated config to the Fusion app registry.             |                   |
| `--manifest <path>` | Path to the app manifest file (required with `--publish`).           |                   |
| `--debug`           | Enable debug mode for verbose logging.                               | `false`           |
| `--silent`          | Silent mode, suppresses output except errors.                        | `false`           |
| `--token`           | Authentication token for Fusion (only relevant with `--publish`).    |                   |
| `--tenantId`        | Azure tenant ID for authentication (only relevant with `--publish`). |                   |
| `--clientId`        | Azure client ID for authentication (only relevant with `--publish`). |                   |

**Usage:**
```sh
pnpm fusion-framework-cli app config [config] [options]
```

**Examples:**
```sh
# Output config to stdout for the current environment
pnpm fusion-framework-cli app config

# Output config for 'prod' environment to a file
pnpm fusion-framework-cli app config --env prod --output ./dist/app.config.json

# Publish config for 'prod' environment to the registry
pnpm fusion-framework-cli app config --publish --manifest app.manifest.ts --env prod

# Use a custom config file for a specific environment
pnpm fusion-framework-cli app config my-custom.config.ts --env ci
```

> [!NOTE]
> - When using `--publish`, you must specify a manifest file with `--manifest` and cannot set `--env` to `dev`.
> - The `--output` option is ignored when publishing; the config is uploaded directly to the registry.
> - Authentication options (`--token`, `--tenantId`, `--clientId`) are only relevant when publishing and can be set via CLI flags or environment variables.
> - If any step fails, an error will be logged and the process will exit with a non-zero code.

### Build
Build your application and generate the necessary artifacts for deployment:

| Option/Argument | Description                                                                                                    | Default / Example                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `[manifest]`    | Manifest file to use for building (e.g., `app.manifest.ts`). If omitted, searches for a default manifest file. | `app.manifest.ts`, `app.manifest.js`, `app.manifest.json` |
| `-d`, `--debug` | Enable debug mode for verbose logging.                                                                         | `false`                                                   |

**Usage:**
```sh
pnpm fusion-framework-cli build [manifest] [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli build
pnpm fusion-framework-cli build app.manifest.dev.ts --debug
```

> [!NOTE]
> The build output location is determined by the `main` field (or `module` field) in your `package.json`. If neither field is specified, the CLI defaults to `./dist/bundle.js`. This approach ensures your package works correctly when served directly or when developing portals with internal references, following Node.js package conventions for proper module resolution. The output directory cannot be the project root, the `src` directory, or the current working directory.
>
> **Examples:**
> - `"main": "dist/index.js"` → builds to `dist/index.js`
> - `"module": "build/app.esm.js"` → builds to `build/app.esm.js`
> - No `main`/`module` specified → defaults to `dist/bundle.js`

### Pack

Build a distributable app bundle archive for deployment.

| Option/Argument   | Description                                                                                           | Default / Example                |
| ----------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------- |
| `[manifest]`      | Manifest file to use for bundling (e.g., `app.manifest.ts`). If omitted, searches for a default file. | `app.manifest.ts`, etc.          |
| `-a`, `--archive` | Name of the output archive file.                                                                      | `app-bundle.zip`                 |
| `-o`, `--output`  | Directory where the archive will be saved.                                                            | Current working directory (`./`) |
| `-d`, `--debug`   | Enable debug mode for verbose logging.                                                                | `false`                          |

**Usage:**
```sh
pnpm fusion-framework-cli pack [manifest] [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli pack
pnpm fusion-framework-cli pack app.manifest.dev.ts --archive my-app.zip --output ./dist
```

> [!NOTE] The `pack` command will also build your application before bundling. It bundles your application and all necessary files into an archive for deployment. If no manifest is provided, it will search for a default `app.manifest.[ts|js|json]` in the current directory.
>
> Additionally, the `pack` command generates a `metadata.json` file alongside the archive. This file records the app name and version of the build, which can be useful for tracking and deployment automation.

### Upload

Upload your Fusion application bundle to the Fusion app store (registry).

| Option/Argument  | Description                                                                                       | Default / Example |
| ---------------- | ------------------------------------------------------------------------------------------------- | ----------------- |
| `[bundle]`       | Application bundle to upload (e.g., `app-bundle.zip`). If omitted, uses the default archive name. | `app-bundle.zip`  |
| `-k`, `--appKey` | Application key. If not provided, resolved from the manifest file.                                |                   |
| `-e`, `--env`    | Target environment for upload (e.g., `ci`, `fqa`, `fprd`).                                        |                   |
| `-d`, `--debug`  | Enable debug mode for verbose logging.                                                            | `false`           |
| `--token`        | Authentication token for Fusion.                                                                  |                   |
| `--tenantId`     | Azure tenant ID for authentication.                                                               |                   |
| `--clientId`     | Azure client ID for authentication.                                                               |                   |

**Usage:**
```sh
pnpm fusion-framework-cli app upload [bundle] [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli app upload
pnpm fusion-framework-cli app upload my-app-bundle.zip --appKey my-app
pnpm fusion-framework-cli app upload --env prod
pnpm fusion-framework-cli app upload --debug
```

> [!NOTE]
> The `upload` command uploads a distributable application bundle to the Fusion app registry. You can specify the application key directly or let the command resolve it from the manifest file. Supports environment selection and debug mode. If no bundle is provided, the CLI will use the default archive name (`app-bundle.zip`).
> 
> If the upload fails, an error will be logged and the process will exit with a non-zero code.

### Tag

Tag a published application version in the Fusion app store (registry).

Tag a specific version of your Fusion application in the Fusion app registry for release management.

The `tag` command applies a tag (such as `latest`, `preview`, or `stable`) to a published application version. This helps you manage which version is considered the default for deployment or preview purposes.

| Argument/Option           | Description                                                        | Default / Example |
| ------------------------- | ------------------------------------------------------------------ | ----------------- |
| `<tag>`                   | Tag to apply (`latest` \| `preview` \| `stable`).                  |                   |
| `--appKey <string>`       | Application key. If not provided, resolved from the manifest file. |                   |
| `-v, --version <string>`  | Version to tag. If not provided, resolved from the manifest file.  |                   |
| `-m, --manifest <string>` | Manifest file to use for resolving app key and version.            | `app.manifest.ts` |
| `--debug`                 | Enable debug mode for verbose logging.                             | `false`           |
| `--silent`                | Silent mode, suppresses output except errors.                      | `false`           |
| `-e, --env <env>`         | Target environment.                                                |                   |
| `--token`                 | Authentication token for Fusion.                                   |                   |
| `--tenantId`              | Azure tenant ID for authentication.                                |                   |
| `--clientId`              | Azure client ID for authentication.                                |                   |

**Usage:**
```sh
pnpm fusion-framework-cli app tag <tag> [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli app tag latest
pnpm fusion-framework-cli app tag preview --env prod --manifest app.manifest.prod.ts
pnpm fusion-framework-cli app tag latest --appKey my-app --version 1.2.3
```

> [!TIP] You can roll back a release by tagging a previous build as `latest`. Simply run the tag command with the desired version to make it the active release for deployment.

> [!NOTE]
> - The `tag` command requires a published application version. You can specify the app key and version directly, or let the CLI resolve them from your manifest file.
> - Supported tags are: `latest` and `preview`.
> - Authentication options (`--token`, `--tenantId`, `--clientId`) can be set via CLI flags or environment variables.
> - If tagging fails, an error will be logged and the process will exit with a non-zero code.

### Manifest

Generate and output your application manifest for Fusion apps.

| Option/Argument       | Description                                                                | Default / Example |
| --------------------- | -------------------------------------------------------------------------- | ----------------- |
| `[manifest]`          | Manifest build file to use (e.g., `app.manifest[.env]?.[ts,js,json]`).   | `app.manifest.ts` |
| `-d, --debug`         | Enable debug mode for verbose logging.                                    | `false`           |
| `-o, --output <path>` | Write manifest to the specified file (default: stdout).                   | `stdout`          |
| `-s, --silent`        | Silent mode, suppresses output except errors.                             | `false`           |

**Usage:**
```sh
pnpm fusion-framework-cli app manifest [manifest] [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli app manifest
pnpm fusion-framework-cli app manifest app.manifest.prod.ts --output ./dist/app.manifest.json
pnpm fusion-framework-cli app manifest --debug
```

> **Tip:** By default, the manifest is printed to stdout. Use `--output` to write it to a file for use in CI/CD pipelines or for inspection.

### Check

Check if a Fusion application is registered in the Fusion app store (registry).

Checks if your application is registered in the Fusion app store and helps identify registration or configuration issues.

| Option/Argument       | Description                                           | Default / Example |
| --------------------- | ----------------------------------------------------- | ----------------- |
| `-d`, `--debug`       | Enable debug mode for verbose logging.                | `false`           |
| `--environment <env>` | Specify the environment (see available environments). |                   |
| `--token <token>`     | Provide an authentication token (if required).        |                   |

**Usage:**
```sh
pnpm fusion-framework-cli app check [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli app check
pnpm fusion-framework-cli app check --environment prod --debug
```

> [!NOTE]
> - Use this command to verify your app's registration status in the Fusion app store.
> - Supports authentication and environment selection.
> - Use `--debug` for verbose output to help troubleshoot registration issues.

### Aliases (Deprecated Commands)

> [!IMPORTANT]
> **Deprecated Command Aliases:**
> The Fusion Framework CLI previously supported several `build-*` commands for app lifecycle tasks. These commands are now deprecated in favor of more consistent and future-proof command names (`pack`, `upload`, `manifest`, `publish`).
> 
> **Why the change?**
> - The new command names are shorter, clearer, and better reflect their purpose.
> - This change aligns with industry standards and prepares for future CLI enhancements.
> - Deprecated commands will be removed in future versions—update your scripts and workflows now to avoid breaking changes.
> 
> For a full migration guide, see [Migration v10 to v11](./migration-v10-to-v11.md).

The CLI will warn you and redirect to the new command when you use a deprecated alias, applying any necessary options automatically. See the table below for mappings:

| Deprecated Command | New Command | Notes                                                                    |
| ------------------ | ----------- | ------------------------------------------------------------------------ |
| `build-pack`       | `pack`      | Warns and sets default archive if not specified.                         |
| `build-upload`     | `upload`    | Warns, maps `--service` to `--env`, and sets bundle argument if omitted. |
| `build-manifest`   | `manifest`  | Warns and redirects to the new command.                                  |
| `build-publish`    | `publish`   | Warns, maps `--service` to `--env`.                                      |

> [!NOTE]
> The `--service` option is deprecated and replaced by `--env`. Using `--service` will result in an error.

**Example:**
```sh
pnpm fusion-framework-cli build-pack
# Outputs a deprecation warning and runs 'pack' with compatible options.
```

> [!WARNING]
> The deprecated commands will be removed in future versions. Please update your scripts and workflows to use the new command names (`pack`, `upload`, `manifest`, `publish`) to ensure compatibility with v11 and beyond.
> For a full migration guide, see [Migration v10 to v11](./migration-v10-to-v11.md).

---

> **Need more examples?**
> - See the [cookbooks/](../../cookbooks/) directory for real-world app examples.
> - For migration help, see [Migration v10 to v11](./migration-v10-to-v11.md).
> - For advanced configuration, see [Authentication](./auth.md) and [CI/CD](#cicd).