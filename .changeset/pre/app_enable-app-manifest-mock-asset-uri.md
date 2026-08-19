---
"@equinor/fusion-framework-app": minor
---

`enableAppManifestMock` accepts an optional third `assetUri` argument, overriding the base URI a loaded app's script is imported from — useful for tests that dynamically import a real fixture script. `env.config` is now optional; when omitted, a trivial `AppConfig` is used so `App.initialize()` can still resolve.
