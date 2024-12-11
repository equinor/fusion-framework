---
'@equinor/fusion-framework-docs': patch
---

### Changes

- Update defineAppConfig function:
  - Change scope to var in the environment object.
  - Add scopes array to the api endpoint.

- Update configure function:
  - Change configureClient to configureHttpClient.
  - Update the configuration to include baseUri and defaultScopes.

- Update defineAppManifest function:
  - Add version to the build object.

- Correct CLI command:
  - Change app pack to app build-pack.

