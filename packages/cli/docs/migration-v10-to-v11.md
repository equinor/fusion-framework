---
title: Migration Guide - v10 to v11 CLI Command Changes
description: >
  Comprehensive guide to migrating CLI commands from v10 to v11 of the Fusion Framework, including deprecated commands, new command names, authentication changes, and best practices for updating scripts and pipelines.
category: cli
related:
  - ./auth.md
  - ./application.md
tags:
  - cli
  - fusion-framework
  - migration
  - breaking-changes
  - upgrade
keywords:
  - fusion framework
  - cli commands
  - v10 to v11 migration
  - deprecated commands
  - authentication changes
  - service discovery
  - environment configuration
  - upgrade guide
  - best practices
---

# Migration Guide: v10 to v11 CLI Command Changes

With v11, we switched to using the Fusion Framework itself for CLI operations. This change was made to reduce maintenance and improve consistency by reusing the same framework modules (such as service-discovery, authentication, and HTTP) in both Node.js and browser environments. By leveraging the Fusion Framework directly, CLI features and integrations stay up-to-date and benefit from shared improvements across the ecosystem.

## Why This Matters
- **Unified experience:** The CLI now behaves more like Fusion apps, making it easier to reason about configuration, authentication, and service discovery.
- **Reduced duplication:** By reusing core modules, bug fixes and new features are shared between CLI and Framework code.
- **Performance:** The framework is now initialized only when needed (e.g., for HTTP calls or authentication), improving startup time and resource usage.

## Deprecated App Command Aliases

This guide covers command changes for the `fusion-framework-cli app` scope.

The following table lists the old commands and their new equivalents:

| Old Command    | New Command |
| -------------- | ----------- |
| build-pack     | pack        |
| build-upload   | upload      |
| build-manifest | manifest    |
| build-publish  | publish     |

When using a deprecated command, the CLI will display a warning message and guide you to use the new command. Deprecated options such as `--service` are no longer supported; use `--env` instead.

> [!WARNING]
> The deprecated commands will continue to work for now, but they are scheduled for removal in the next major release. Please migrate to the new commands as soon as possible.

### Additional Notes
- The deprecated `--service` option is no longer supported. Use `--env` for environment selection.
- Only the new command names will be supported in future versions. Update your CI/CD pipelines and documentation as soon as possible.
- The deprecated commands are maintained for backward compatibility during the transition to v11, but will be removed in the next major release. Please migrate to the new commands as soon as possible.

## Authentication Changes
- The `FUSION_TOKEN` environment variable should only be used for CI/CD and automated deployments.
- For local development, users should authenticate interactively by running:
  ```sh
  fusion-framework-cli auth login
  ```
  before executing any commands.

## What to Check When Migrating
- Update all scripts, documentation, and CI/CD pipelines to use the new command names.
- Remove any usage of the deprecated `--service` option and replace it with `--env`.
- Ensure your local development workflow uses `fusion-framework-cli auth login` for authentication.
- Review any custom integrations that may rely on CLI startup behavior, as initialization is now on-demand.

For more details, see the CLI release notes or run `pnpm fusion-framework-cli app --help`.

