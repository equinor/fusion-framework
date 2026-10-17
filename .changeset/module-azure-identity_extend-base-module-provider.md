---
"@equinor/fusion-framework-module-azure-identity": patch
---

`AuthProviderDefaultCredential`, `AuthProviderTokenOnly`, `AuthProviderInteractiveBrowser`, and the mock `MockAuthProvider` now extend `BaseModuleProvider` and expose the package `version`, so the CLI no longer emits `ModuleConfigurator.provider.invalidBase` and `ModuleConfigurator.provider.versionMissing` warnings for the auth module. Each provider also gains a `dispose()` method. Constructor signatures are unchanged, and access tokens are not passed to the base class.

Resolves equinor/fusion-core-tasks#2389
