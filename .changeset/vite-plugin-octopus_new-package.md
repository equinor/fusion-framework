---
"@equinor/fusion-framework-vite-plugin-octopus": minor
---

New package: Vite plugins that let a local Fusion portal load apps from their local dev servers through Octopus, a small local app registry and proxy. Apps that are not running locally still come from CI.

- `octopusAppPlugin` registers an app dev server with Octopus, sends heartbeats, unregisters on close, lets the portal load the app's modules across origins, and scans the app's source at startup.
- `octopusPortalPlugin` answers manifest, config and script requests for registered apps from their dev server, tells the portal UI where an app comes from (`GET /@fusion-api/octopus/apps/<appKey>`), and starts Octopus when it is not running. API requests from an app in mock mode go to its mock server, for the services it mocks.
- `./server` exports the Octopus server (`startOctopus`, `Registry`), with a page listing the registered apps.
