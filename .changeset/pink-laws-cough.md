---
'@equinor/fusion-framework-cli': minor
---

** @equinor/fusion-framework-cli**

**Changes:**

Updated commands in CLI to reflect purpose of the command:
- renamed `config` to `build-config` to generate build config of an application.
- renamed `pack`to `build-pack` to bundle an application.
- added `build-manifest` command to generate build manifest of an application.

> [!WARNING]
> Config callback for `manifest` and `config` now allows `void` return type. 
> Return value from callback is now merged with default config instead of replacing it, this might be a breaking change for some applications.

> [!NOTE]
> This mean that `mergeAppConfig` and `mergeManifestConfig` functions are no longer needed and can be removed from the application.
