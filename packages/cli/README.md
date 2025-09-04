[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./LICENSE)

Fusion Framework CLI is a command-line tool for developing, building, and publishing applications and portal templates within the Fusion Framework ecosystem. It streamlines workflows, automates common tasks, and supports modern CI/CD pipelines.

**What you can build:**
- **Fusion Applications**: Interactive web apps that run within the Fusion Portal
- **Portal Templates**: Customizable portal configurations for different business contexts

**Key capabilities:**
- Development server with hot reload and service discovery
- Application manifest and configuration management
- Automated building, bundling, and deployment
- Environment-specific configuration handling
- Integrated authentication and authorization
- CI/CD pipeline support with automated publishing

## Prerequisites

- **Node.js** (LTS version recommended)
- **pnpm** (or npm/yarn) package manager
- **Fusion Framework app or portal project** (or create a new one)
- **Access to Fusion services** (for authentication and deployment)

## Features & Benefits

- **🚀 Unified developer experience**: Single tool for the entire development lifecycle - from local development to production deployment
- **⚡ Rapid local development**: Built-in dev server with hot reload, service discovery, and real-time feedback
- **🎯 Environment-specific configuration**: Seamlessly manage manifests and configs across dev, test, and production environments
- **🔐 Integrated authentication**: Secure your apps locally and in CI/CD with Azure AD integration and token management
- **🔍 Service discovery**: Built-in support for Fusion services with automatic endpoint resolution
- **📦 Automated bundling & deployment**: One-command building, packaging, and publishing to Fusion registry
- **🏗️ Extensible architecture**: Support for apps, portals, widgets, and future Fusion components
- **📚 Comprehensive documentation**: Migration guides, detailed setup instructions, and troubleshooting resources

## Getting Started

**Install the CLI**

```sh
pnpm add -D @equinor/fusion-framework-cli
```

**Initialize or update your app's manifest and config files**

Create the required configuration files for your app:

- `app.manifest.ts` - Defines your app's metadata and capabilities
- `app.config.ts` - Contains runtime configuration and environment variables

See [Developing Apps](docs/application.md) for detailed setup and configuration guidance.

**Start the development server**

```sh
pnpm fusion-framework-cli dev
```

**Log in to the Fusion Framework (if needed)**

```sh
pnpm fusion-framework-cli auth login
```

**Build and publish your app**

```sh
pnpm fusion-framework-cli publish --env <environment>
```

**Upload configuration**

```sh
pnpm fusion-framework-cli app config --publish --env <environment>
```

> **Tip:** For CI/CD and automation, set the `FUSION_TOKEN` environment variable. See [Authentication](docs/auth.md) for details.

## Common Commands

| Command                                | Description                          |
| -------------------------------------- | ------------------------------------ |
| `pnpm fusion-framework-cli auth ...` | Authenticate with Fusion             |
| `pnpm fusion-framework-cli app ...`    | Working with Fusion applications     |
| `pnpm fusion-framework-cli portal ...` | Working with Fusion portal templates |
| `pnpm fusion-framework-cli disco ...` | Service discovery and resolution     |

## Example: package.json

A minimal example for a Fusion Framework app:

```json
{
  "name": "@equinor/fusion-framework-app",
  "version": "1.0.0",
  "description": "My Fusion Framework Application",
  "main": "dist/bundle.js",
  "files": [
    "dist/",
    "assets/",
    "README.md"
  ],
  "scripts": {
    "build": "fusion-framework-cli app build",
    "dev": "fusion-framework-cli dev",
    "publish": "fusion-framework-cli app publish"
  },
  "devDependencies": {
    "@equinor/fusion-framework-cli": "^11.0.0"
  }
}
```

**Key fields:**
- `main`: **Required** - Points to your build output directory (CLI uses this to determine where to place built files)
- `files`: Specifies which files to include in your app bundle
- `scripts`: Convenient shortcuts for common CLI commands

> **Note:** The CLI determines the build output location from the `main` field in your package.json. If not specified, it defaults to `dist/bundle.js`.

## Documentation

**Getting Started**
- [Developing Apps](docs/application.md): Complete guide to building, configuring, and deploying Fusion applications
- [Developing Portals](docs/portal.md): Guide to building, configuring, and publishing portal templates

**Setup & Configuration**
- [Authentication](docs/auth.md): Setting up authentication for local development and CI/CD environments
- [libsecret Installation](docs/libsecret.md): Fix credential storage issues on Linux systems

**Migration & Updates**
- [Migration Guide: v10 to v11](docs/migration-v10-to-v11.md): Breaking changes, deprecated commands, and upgrade instructions

**Additional Resources**
- [CLI Command Reference](docs/application.md#commands): Detailed documentation of all available commands and options
- [CI/CD Best Practices](docs/application.md#ci-cd): Automated workflows and deployment strategies
- [Troubleshooting Guide](docs/application.md#troubleshooting-faq): Common issues and solutions

  ## Troubleshooting

### Common Issues

**Authentication & Credentials**
- **Authentication issues?** See [Authentication Guide](docs/auth.md) for token setup and troubleshooting
- **libsecret errors on Linux?** Install libsecret using our [installation guide](docs/libsecret.md)

**CLI & Commands**
- **Command not found?** Ensure `node_modules/.bin` is in your PATH or use `pnpm`/`npx`
- **Permission errors?** Check that you have the correct access rights to Fusion services

**Build & Development**
- **Build errors?** Verify your `app.manifest.ts` and `app.config.ts` files for syntax errors
- **Dev server not starting?** Check for port conflicts (default: 3000) or use `--port` option
- **Missing dependencies?** Ensure all required packages are installed with `pnpm install`

**Publishing & Deployment**
- **Upload failures?** Verify your app is registered in the Fusion App Admin
- **Environment issues?** Check that you're using the correct `--env` parameter

### Getting Help

- **Detailed troubleshooting:** See our [comprehensive troubleshooting guide](docs/application.md#troubleshooting-faq)
- **Found a bug?** Open an issue on our GitHub repository
- **Need support?** Check the [docs folder](docs/) or reach out to the Fusion team

