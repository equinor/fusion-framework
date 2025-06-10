---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Refactor plugin internals for improved Vite compatibility and maintainability:

- Made `resolveId` and `config` hooks async to support dynamic import resolution for virtual modules.
- Improved resource alias resolution for `/@fusion-spa-bootstrap.js` and `/@fusion-spa-sw.js` using `import.meta.resolve` and `fileURLToPath`.
- Enhanced environment variable handling by merging plugin and loaded environments, and defining them on `config.define`.
- Ensured the Vite dev server allows access to the correct `../html` directory for SPA templates.
- Added more robust logging for environment configuration and plugin setup.
