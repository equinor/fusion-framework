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

- must mention `processServices` from `@equinor/fusion-framework-dev-server` for custom service processing
- must show adding mock services via `api.processServices` callback that returns `data` and `routes`
- must show a custom `routes` entry with `match` pattern and `middleware` function
- should show concatenating mock services onto the discovered services array
- should show the middleware signature with `(req, res)` for handling mock responses

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
