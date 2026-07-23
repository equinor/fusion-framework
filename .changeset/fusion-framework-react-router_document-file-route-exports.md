---
"@equinor/fusion-framework-react-router": patch
---

Document all supported file-route exports for the React Router Vite plugin.

The `README.md`, `BaseFileRoute` class, and `getAvailableExports` in the Vite plugin now carry a complete reference table of the six named exports the plugin recognises and wires into the generated React Router data route:

| Export | Mapped to |
|---|---|
| `default` | `Component` |
| `clientLoader` | `loader` |
| `action` | `action` |
| `handle` | `handle` |
| `ErrorElement` | `errorElement` |
| `HydrateFallback` | `HydrateFallback` |

The README was also updated to fix incorrect prerequisites (Fusion packages are bundled dependencies, not peer dependencies), clarify the `/context` entry point, and add GFM alert callouts for common gotchas (navigation module configuration, file-path resolution, Vite plugin being required for code-splitting).

Reported by: @yusijs in https://github.com/equinor/fusion/issues/870
Closes: https://github.com/equinor/fusion-core-tasks/issues/1630
