---
"@equinor/fusion-framework-module-azure-identity": patch
---

Internal: resolve `fusion-lint` warnings (`require-intent-comment`, `require-tsdoc`, `single-export-per-file`). Split `ensureCachePersistencePlugin` out of `AuthProviderDefaultCredential.ts` and split the `enableAzureIdentity*` helper functions out of `enable-module.ts` into individual files to resolve `single-export-per-file` without conflicting with TSDoc adjacency. Added missing constructor/`@param`/`@returns`/`@throws` TSDoc and intent comments to control-flow blocks.
