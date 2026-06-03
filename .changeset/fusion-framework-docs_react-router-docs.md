---
"@equinor/fusion-framework-docs": patch
---

Add getting started, migration, and interop documentation for `@equinor/fusion-framework-react-router`,
and a routing guide for `@equinor/fusion-framework-react-app`.

- **Getting started** — 7-step setup walkthrough covering navigation config, route DSL, `<Router>` mount,
  page loaders, hooks, custom context, and the Vite plugin. Framed for all Fusion consumers (apps, portals, widgets).
- **Migration guide** — step-by-step instructions for moving from a plain `react-router` setup to the Fusion router.
- **Interop entry point** — documents `./interop` with code examples for `MemoryRouter`, `createMemoryRouter + RouterProvider`,
  and `Routes + Route`; explains the dual-bundling risk that motivates the interop bridge.
- **Routing (react-app)** — documents the `./routing` entry point on `@equinor/fusion-framework-react-app`
  with installation, configuration, and usage examples.
