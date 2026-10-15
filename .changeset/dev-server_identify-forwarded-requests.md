---
"@equinor/fusion-framework-dev-server": patch
---

Identify requests forwarded by the dev server to Fusion services. Service discovery and proxied service calls now carry `X-Fusion-CLI-Name: fusion-framework-dev-server` and `X-Fusion-CLI-Version`, so services can tell them apart from anonymous browser traffic. Browser-supplied values for these headers are overwritten.

Related: https://github.com/equinor/fusion-core-tasks/issues/2207
