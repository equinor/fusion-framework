---
title: Fusion Framework CLI
description: >
  Fusion Framework CLI is a powerful tool for developing, building, and publishing applications and portal templates within the Fusion Framework ecosystem. See the documentation for full guides, configuration, and advanced usage.
tags: 
  - fusion-framework
  - cli
  - app-development
  - portal-development
  - dev-server
  - ci-cd
  - authentication
  - configuration
  - manifest
  - registry
  - publishing
  - service-discovery
  - equinor
  - documentation
  - getting-started
keywords:
  - fusion framework
  - cli
  - app development
  - portal development
  - dev server
  - authentication
  - ci/cd
  - configuration
  - manifest
  - publishing
  - registry
  - service discovery
---

# Fusion Framework CLI

[![npm version](https://img.shields.io/npm/v/@equinor/fusion-framework-cli.svg?style=flat)](https://www.npmjs.com/package/@equinor/fusion-framework-cli)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./LICENSE)

---

## Table of Contents

- [Fusion Framework CLI](#fusion-framework-cli)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features \& Benefits](#features--benefits)
  - [Getting Started](#getting-started)
    - [1. Install the CLI](#1-install-the-cli)
    - [2. Initialize or update your app's manifest and config files](#2-initialize-or-update-your-apps-manifest-and-config-files)
    - [3. Start the development server](#3-start-the-development-server)
    - [4. Log in to the Fusion Framework (if needed)](#4-log-in-to-the-fusion-framework-if-needed)
    - [5. Build and publish your app](#5-build-and-publish-your-app)
    - [6. Upload configuration](#6-upload-configuration)
  - [Common Commands](#common-commands)
  - [Example: package.json](#example-packagejson)
  - [Troubleshooting](#troubleshooting)
  - [Documentation](#documentation)
  - [Contributing](#contributing)
  - [Tooling Roadmap](#tooling-roadmap)

## Overview

Fusion Framework CLI is a command-line tool for developing, building, and publishing applications and portal templates within the Fusion Framework ecosystem. It streamlines workflows, automates common tasks, and supports modern CI/CD pipelines.

## Features & Benefits

- **Unified developer experience**: One tool for development, build, and deployment.
- **Rapid local development**: Hot reload and fast feedback.
- **Environment-specific configuration**: Manage manifests and configs per environment.
- **Integrated authentication**: Secure your apps locally and in CI/CD pipelines.
- **Service discovery**: Built-in support for Fusion services.
- **Extensible architecture**: Widgets, portals, and more coming soon.
- **Comprehensive documentation**: Migration guides, app/portal setup, and troubleshooting.

## Getting Started

### 1. Install the CLI

```sh
pnpm add -D @equinor/fusion-framework-cli
```

### 2. Initialize or update your app's manifest and config files

See [Developing Apps](./docs/application.md) for manual setup and configuration guidance.

### 3. Start the development server

```sh
pnpm fusion-framework-cli dev
```

### 4. Log in to the Fusion Framework (if needed)

```sh
pnpm fusion-framework-cli auth login
```

### 5. Build and publish your app

```sh
pnpm fusion-framework-cli publish --env <environment>
```

### 6. Upload configuration

```sh
pnpm fusion-framework-cli app config --upload --env <environment>
```

> **Tip:** For CI/CD and automation, set the `FUSION_TOKEN` environment variable. See [Authentication](./docs/auth.md) for details.

## Common Commands

| Command                                | Description                          |
| -------------------------------------- | ------------------------------------ |
| `pnpm fusion-framework-cli dev`        | Start local development server       |
| `pnpm fusion-framework-cli auth login` | Authenticate with Fusion             |
| `pnpm fusion-framework-cli app ...`    | Working with Fusion applications     |
| `pnpm fusion-framework-cli portal ...` | Working with Fusion portal templates |

## Example: package.json

A minimal example for a Fusion Framework app:

```json
{
  "name": "@equinor/fusion-framework-app",
  "version": "0.0.0",
  "description": "Fusion Framework App",
  "main": "dist/index.js",
  "files": [
    "path-to-some-file/foo.png"
  ]
}
```

> **Note:** The `main` field should point to the build output (e.g., `dist/index.js`).

## Troubleshooting

- **Command not found?** Ensure your `node_modules/.bin` is in your PATH or use `pnpm`/`npx`.
- **Authentication issues?** See [Authentication](./docs/auth.md) for troubleshooting tokens and login.
- **Build errors?** Check your app's manifest and config files for typos or missing fields.
- **Need help?** Open an issue or see the [docs folder](./docs/).

## Documentation

- [Migration Guide: v10 to v11](./docs/migration-v10-to-v11.md): Learn about breaking changes and how to upgrade.
- [Developing Apps](./docs/application.md): Step-by-step guide to building and configuring apps.
- [Developing Portals](./docs/portal.md): Guide to building, configuring, and publishing portal templates.
- [Authentication](./docs/auth.md): Setting up authentication for local and CI/CD environments.
- For more guides and advanced topics, see the [docs folder](./docs/).

## Contributing

We welcome contributions! See our [contributing guide](../../contributing/development.md) for details on how to get started, coding standards, and submitting pull requests.

## Tooling Roadmap

- **Vitest integration** (coming soon)
---

For more information, visit the [docs folder](./docs/) or open an issue for support.

