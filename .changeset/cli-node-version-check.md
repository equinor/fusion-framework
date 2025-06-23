---
"@equinor/fusion-framework-cli": patch
---

- Add Node.js version check and LTS recommendation to CLI entrypoint (`main.ts`).
- Update build config to inject `MINIMUM_NODE_VERSION` and `RECOMMENDED_NODE_LTS` via environment variables using `@rollup/plugin-replace`.
- Refactor CLI entrypoint for clarity and maintainability.
- Remove excessive file-level comments from `main.ts`.
