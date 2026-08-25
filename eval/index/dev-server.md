# Development Server

Ensure results reference `@equinor/fusion-framework-dev-server` or `@equinor/fusion-framework-cli`.
Verify that mentioned functions, types, and configuration options are real exports from the dev-server package.
Reject results that confuse dev-server configuration with runtime module configuration, or that mix up browser-side telemetry with CLI-side logging.

## How to create and start a Fusion dev server

- must mention `createDevServer` from `@equinor/fusion-framework-dev-server`
- must show the `DevServerOptions` structure with `spa` and `api` sections
- must show calling `devServer.listen()` to start the server
- should mention `createDevServerConfig` for generating a Vite configuration without starting
- should mention Vite configuration overrides as the second argument to `createDevServer`
- should mention the CLI shorthand `fusion-framework-cli dev` or `ffc dev` as an alternative

## How to mock API responses in local development

- must mention executable `<name>.mock.ts` modules created with `defineService`
- must show how `serviceDiscovery: 'merge'`, `'new'`, or `'replace'` makes a local definition visible
- should mention that normal `ffc app dev` derives local proxy services from visible `defineService` modules and merges them by key into real discovery
- must state that `ffc app dev --mock <origin>` ignores normal-dev definitions and uses only the manually started mock server's presets and local `defineService` modules
- must not claim that `ffc app dev` automatically starts `ffc mock-server`

## How to configure API proxying and custom routes

- must mention `api.serviceDiscoveryUrl` as the required service discovery endpoint
- must mention `api.routes` array for adding custom API route handlers
- must show `match` pattern and `middleware` function on an `ApiRoute`
- should mention `processServices` utility for processing service discovery data into proxy routes
- should mention `FusionService` type with `key`, `uri`, and `name` properties

## How to configure service discovery for the dev server

- must mention `spa.templateEnv.serviceDiscovery` with `url` and `scopes` properties
- must mention `api.serviceDiscoveryUrl` for the server-side proxy endpoint
- must show that both SPA-side and API-side service discovery config are needed
- should mention that `processServices` generates proxy routes from discovered services
- should mention session overrides via `sessionStorage` key `overriddenServiceDiscoveryUrls` for redirecting services locally

## How to configure MSAL authentication for the dev server

- must mention `spa.templateEnv.msal` with `clientId`, `tenantId`, and `redirectUri`
- must mention `requiresAuth` option to enable or disable authentication
- must show the `msal` configuration block within `templateEnv`
- should mention `defaultScopes` on service discovery for token acquisition scopes
- should mention `spa.templateEnv.portal.id` for portal identity configuration
