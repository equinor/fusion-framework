---
"@equinor/fusion-framework-module-ai": patch
"@equinor/fusion-framework-module-bookmark": patch
"@equinor/fusion-framework-module-app": patch
"@equinor/fusion-framework-module-context": patch
"@equinor/fusion-framework-module-azure-identity": patch
"@equinor/fusion-framework-module-feature-flag": patch
"@equinor/fusion-framework-module-service-discovery": patch
"@equinor/fusion-framework-module-signalr": patch
"@equinor/fusion-framework-module-services": patch
"@equinor/fusion-framework-module-telemetry": patch
"@equinor/fusion-framework-module-widget": patch
"@equinor/fusion-framework-module-analytics": patch
"@equinor/fusion-framework-module-msal-node": patch
"@equinor/fusion-framework-module-navigation": patch
---

Internal: renamed 45 source files across these packages to comply with the `filename-convention` lint rule (e.g. `AIConfigurator.ts` → `AiConfigurator.ts`, `BookmarkProvider.actions.ts` → `bookmark-actions.ts`, `errors/app-build-error.ts` → `errors/AppBuildError.ts`, `plugins/api/plugin.ts` → `plugins/api/ApiPlugin.ts`, `errors.ts` → `UnsupportedApiVersion.ts`, etc.). Also added `enable-signalr.ts` to the `filename-convention` exclude list since the suggested rename would incorrectly split the "SignalR" brand name. No public API changes.
