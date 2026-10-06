---
"@equinor/fusion-framework-react-app": patch
---

Fix the package's ESM output for native Node resolution.

`@equinor/fusion-framework-react-app` declares `"type": "module"`, so tools that resolve it through Node (for example Vitest with externalized dependencies) used Node's ESM resolver and failed with `ERR_MODULE_NOT_FOUND` on extensionless relative imports such as `./useAppModule`. All relative imports now carry an explicit `.js` extension, and together with the framework packages it depends on, every sub-path now resolves under native Node ESM.

Also remove the `@equinor/fusion-framework-react-app/widget` sub-path export. Its source was removed together with the React widget package, so the sub-path has failed to resolve since then.

Ref: https://github.com/equinor/fusion/issues/959
