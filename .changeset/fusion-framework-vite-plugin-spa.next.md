---
"@equinor/fusion-framework-vite-plugin-spa": major
---

Introducing a powerful new Vite plugin for building Single Page Applications (SPAs) with the Fusion Framework and Vite. This plugin significantly streamlines the development workflow by automating HTML template generation, bootstrapping authentication and service discovery, and enabling seamless portal loading and API proxying.

**Purpose**:

This plugin represents a strategic modularization of the Fusion Framework CLI codebase. By extracting the SPA functionality into its own dedicated package, we've simplified the CLI's architecture while enabling greater flexibility. This modular design allows the SPA component to be replaced or reused by third-party developers independently of the CLI. The primary goal is to maintain a cleaner, more maintainable codebase through proper separation of concerns, with the CLI using this plugin rather than containing this functionality directly.

**Key Features**:

- **Fusion Framework Bootstrap**: Automatically initializes core modules and renders configured portals
- **Service Discovery**: Enables dynamic service routing and eliminates hardcoded service endpoints
- **MSAL Authentication**: Provides seamless Azure AD integration with configurable authentication flows
- **Service Worker**: Intercepts network requests to add authentication tokens and rewrite URLs for proxying
- **Portal Integration**: Loads and renders any portal by ID from local packages or the Fusion Portal Service
- **Environment Configuration**: Supports flexible configuration through code or `.env` files with proper naming conventions
- **Custom Templates**: Allows full control over HTML document structure while maintaining environment variable injection
- **Custom Bootstrap**: Supports advanced customization of the application initialization process
- **API Service Integration**: Works with `@equinor/fusion-framework-vite-plugin-api-service` for enhanced development capabilities

This plugin is designed for seamless integration with the Fusion Framework CLI and provides flexible configuration for both standard and advanced SPA scenarios.

> Note: This plugin is intended for use in non-production environments only, primarily as a development and testing tool.
