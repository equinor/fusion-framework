# Troubleshooting

Start with the visible symptom, then check the responsible layer. Browser environment, server
discovery, and backend proxying are separate steps.

## The package cannot be resolved

```sh
pnpm add -D @equinor/fusion-framework-dev-server
```

Vite must also satisfy the Vite 7 or 8 peer dependency.

## Service discovery fails

Check `api.serviceDiscoveryUrl` first. The Node process must reach this URL. Authentication, VPN,
DNS, and environment availability can differ from browser access.

If the browser receives the wrong URL, inspect `spa.templateEnv.serviceDiscovery` instead. It
controls browser configuration and does not replace the API option.

## A discovered API request fails

1. Confirm the service key exists in discovery.
2. Enable server debug logging with `log.level: 4`.
3. Inspect the rewritten local service URI returned to the browser.
4. Check that the upstream URI is absolute and reachable from Node.
5. Review custom `api.processServices` logic and route precedence.

## A mock service is missing

The mock server is separate. Confirm `ffc mock-server` is running and
`/@fusion-mock/health` responds.

Normal `ffc app dev` overlays only discovery-visible definitions. Definitions using
`serviceDiscovery: false` must be configured directly in app config, for example with a
`http://<key>.localhost:4010` URL. In `--mock` mode, confirm the application uses the same origin
and port as the manually started server.

## Authentication fails

Check `clientId`, `tenantId`, and `redirectUri` in `spa.templateEnv.msal`. The redirect URI must
match the identity provider registration and local URL.

## Turn on diagnostics

```typescript
const options = {
  api: { serviceDiscoveryUrl: 'https://service-discovery.example.com' },
  log: { level: 4 },
  spa: { templateEnv: { telemetry: { consoleLevel: 0 } } },
};
```

The scales differ: `log.level` uses `0` None through `4` Debug, while browser
`telemetry.consoleLevel` uses `0` Debug through `4` Critical.

> [!TIP]
> Start with `log.level: 4` for discovery and proxy failures. Add browser telemetry only when the
> failure occurs after the page has loaded.