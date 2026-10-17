---
"@equinor/fusion-framework-app": minor
---

Identify the calling app on outgoing HTTP requests.

App HTTP clients now send `x-fusion-app`, `x-fusion-app-version` and `x-fusion-framework-version`, so backend telemetry (`fusion.app`) can attribute traffic and errors to a specific app. By default, the headers only go to the portal origin and to Fusion service-discovery hosts. Requests to other origins are unchanged, so APIs that don't allow the headers see no new CORS preflight. Startup never waits more than two seconds on service discovery for this.

Use `configurator.configureAppIdentification()` to opt in more origins or to turn identification off:

```ts
configurator.configureAppIdentification({ allowedOrigins: ['https://my-backend.example.com'] });
configurator.configureAppIdentification({ enabled: false });
```

Resolves equinor/fusion-core-tasks#2385
