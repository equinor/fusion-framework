---
'@equinor/fusion-framework-cli': minor
---

**@equinor/fusion-framework-cli**

Updated the CLI to use the new service discovery API.

> [!NOTE]
> This is a quick fix until the new major version of the CLI is released.

-   Updated the `baseUri` to use a more specific URL path for service discovery.
-   Changed from `new URL(import.meta.url).origin` to `String(new URL('/_discovery/environments/current', import.meta.url))`.
-   Changed parsing of service discovery response to match new API format.
