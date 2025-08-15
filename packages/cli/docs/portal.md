---
title: Developing Portals with Fusion Framework CLI
description: >
  Guide to building, configuring, and deploying portal templates using the Fusion Framework CLI. Includes setup, essential commands, configuration, troubleshooting, and best practices for portal development.
category: cli
related:
  - ./auth.md
tags:
  - portal-development
  - configuration
  - deployment
  - commands
  - troubleshooting
  - best-practices
keywords:
  - fusion-framework-cli portal
  - fusion portal dev
  - fusion portal build
  - fusion portal pack
  - fusion portal upload
  - fusion portal tag
  - fusion portal manifest
---

# Fusion Framework CLI: Portal Template Development Guide

> **Table of Contents**
> - [Getting Started](#getting-started)
> - [Portal Manifest](#portal-manifest)
> - [Commands](#commands)
> - [Troubleshooting & FAQ](#troubleshooting--faq)

---

The Fusion Framework CLI enables you to build, configure, and deploy **portal templates** for the Fusion ecosystem. These commands are specifically for creating, building, and managing portal templates—not for managing actual portals.

> **What is a Portal Template?**
>
> A portal template is a reusable, versioned package that defines the structure, configuration, and capabilities of a portal. You use the CLI to develop and publish these templates.
>
> **The actual portal** is created when you register a portal in the Portal Admin app and configure it according to the schema defined in your template. Portal registration and configuration are managed outside the CLI, in the Fusion Portal Admin UI.

This guide covers the essential commands and best practices for developing and managing portal templates. For information on registering and configuring portals, see the Portal Admin documentation.

## Getting Started

### 1. Install the CLI

```sh
pnpm add -D @equinor/fusion-framework-cli
# or
npm install --save-dev @equinor/fusion-framework-cli
```

### 2. Scaffold a New Portal

Create a new directory for your portal and initialize your project:

```sh
mkdir my-fusion-portal && cd my-fusion-portal
pnpm init
```

### 3. Create Required Files

- `portal.manifest.ts`: Defines your portal's metadata and configuration.
- `portal.schema.ts` (optional): Defines the schema for portal configuration.

---

## Portal Manifest

The portal manifest (`portal.manifest.ts`) describes your portal's metadata, configuration, and capabilities. It is required for all portal templates. You may also define a schema file for advanced configuration validation.

---

## Commands

### Command Overview

The Fusion Framework CLI provides a suite of commands to support the full portal template lifecycle, from development to deployment. Below is an overview of all available commands with quick links to their detailed usage:

- [Dev](#dev) — Start the portal development server for local development and testing.
- [Build](#build) — Build your portal template using Vite.
- [Pack](#pack) — Bundle your portal into a distributable archive for deployment.
- [Upload](#upload) — Upload your portal bundle to the Fusion portal registry.
- [Tag](#tag) — Tag a published portal template version in the Fusion portal registry.
- [Manifest](#manifest) — Resolve and print the portal manifest for inspection or debugging.
- [Schema](#schema) — Generate and validate the JSON schema for your Fusion portal application.

---

### Dev

Start the portal development server for local development and testing.

| Option              | Description                             | Default / Example    |
| ------------------- | --------------------------------------- | -------------------- |
| `--manifest <path>` | Path to the portal manifest file.       | `portal.manifest.ts` |
| `--config <path>`   | Path to the portal config file.         | `portal.config.ts`   |
| `--env <env>`       | Runtime environment for the dev server. | `local`              |
| `--port <port>`     | Port for the development server.        | `3000`               |

**Usage:**
```sh
pnpm fusion-framework-cli portal dev [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli portal dev
pnpm fusion-framework-cli portal dev --port 4001 --manifest ./portal.manifest.ts
```

---

### Build

Build your portal template using Vite.

| Option              | Description                        | Default / Example    |
| ------------------- | ---------------------------------- | -------------------- |
| `--manifest <path>` | Path to the portal manifest file.  | `portal.manifest.ts` |
| `--env <env>`       | Runtime environment for the build. | `production`         |

**Usage:**
```sh
pnpm fusion-framework-cli portal build [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli portal build
pnpm fusion-framework-cli portal build --manifest ./portal.manifest.ts --env ci
```

---

### Pack

Bundle your portal into a distributable archive for deployment.

| Option              | Description                       | Default / Example    |
| ------------------- | --------------------------------- | -------------------- |
| `--manifest <path>` | Path to the portal manifest file. | `portal.manifest.ts` |
| `--schema <path>`   | Path to the portal schema file.   | `portal.schema.ts`   |
| `--archive <name>`  | Name of the output archive file.  | `portal-bundle.zip`  |

**Usage:**
```sh
pnpm fusion-framework-cli portal pack [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli portal pack
pnpm fusion-framework-cli portal pack --archive my-portal.zip --schema ./portal.schema.ts
```

---

### Upload

Upload your portal bundle to the Fusion portal registry.

| Option          | Description                              | Default / Example   |
| --------------- | ---------------------------------------- | ------------------- |
| `[bundle]`      | Path to the portal bundle archive.       | `portal-bundle.zip` |
| `--name <name>` | Portal name (overrides bundle metadata). |                     |
| `--token`       | Authentication token for Fusion.         |                     |
| `--tenantId`    | Azure tenant ID for authentication.      |                     |
| `--clientId`    | Azure client ID for authentication.      |                     |

**Usage:**
```sh
pnpm fusion-framework-cli portal upload [bundle] [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli portal upload
pnpm fusion-framework-cli portal upload my-portal.zip --name my-portal
```

---

### Tag

Tag a published portal template version in the Fusion portal registry.

| Option/Argument   | Description                           | Default / Example |
| ----------------- | ------------------------------------- | ----------------- |
| `<tag>`           | Tag to apply (`latest` \| `preview`). |                   |
| `--name <name>`   | Portal name.                          |                   |
| `--version <ver>` | Version to tag.                       |                   |
| `--token`         | Authentication token for Fusion.      |                   |
| `--tenantId`      | Azure tenant ID for authentication.   |                   |
| `--clientId`      | Azure client ID for authentication.   |                   |

**Usage:**
```sh
pnpm fusion-framework-cli portal tag <tag> [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli portal tag latest --name my-portal --version 1.0.0
pnpm fusion-framework-cli portal tag preview --name my-portal --version 1.1.0-beta
```

---

### Manifest

Resolve and print the portal manifest for inspection or debugging.

| Option              | Description                                  | Default / Example    |
| ------------------- | -------------------------------------------- | -------------------- |
| `--manifest <path>` | Path to the portal manifest file.            | `portal.manifest.ts` |
| `--env <env>`       | Runtime environment for manifest resolution. | `local`              |

**Usage:**
```sh
pnpm fusion-framework-cli portal manifest [options]
```

**Examples:**
```sh
pnpm fusion-framework-cli portal manifest
pnpm fusion-framework-cli portal manifest --manifest ./portal.manifest.ts --env ci
```

---

### Schema

Generate and validate the JSON schema for your Fusion portal application.

| Option/Argument  | Description                                                           | Default / Example |
| ---------------- | --------------------------------------------------------------------- | ----------------- |
| `[schema]`       | Schema build file to use (e.g., `portal.schema[.env]?.[ts,js,json]`). |                   |
| `-o, --output`   | Output file name (default: stdout).                                   | `stdout`          |
| `-d, --debug`    | Enable debug mode for verbose logging.                                | `false`           |
| `-v, --validate` | Validate the generated schema against a JSON file.                    |                   |
| `--env <env>`    | Runtime environment for schema generation (supports dev).             |                   |

**Usage:**
```sh
pnpm fusion-framework-cli portal schema [schema] [options]
```

**Examples:**
```sh
# Generate schema and print to stdout
pnpm fusion-framework-cli portal schema

# Generate schema and write to a file
pnpm fusion-framework-cli portal schema --output portal.schema.json

# Validate a config file against the generated schema
pnpm fusion-framework-cli portal schema --validate my-config.json

# Use a specific schema file and enable debug mode
pnpm fusion-framework-cli portal schema portal.schema.prod.ts --debug
```

---

## Troubleshooting & FAQ

- **Manifest/config not found:** Ensure `portal.manifest.ts` exists in your project root.
- **Build errors:** Check your Vite config and ensure all dependencies are installed.
- **Authentication issues:** Make sure you have the correct permissions and tokens for uploading or tagging.
- **Command help:** Run any command with `--help` for detailed usage and options.

---

For advanced configuration and authentication, see [Authentication](./auth.md).
