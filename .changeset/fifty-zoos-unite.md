---
"@equinor/fusion-framework-cli": patch
---

Limit token interception to OPTIONS requests on help-proxy path

The previous implementation of the help-proxy middleware would intercept all requests under `/help-proxy` with an `Authorization` header and immediately end the response. This inadvertently affected other routes such as `/app-proxy` by short-circuiting legitimate proxy requests.

This change limits the interception logic to only handle `OPTIONS` requests specifically targeting `/help-proxy` paths. This ensures token preservation for preflight requests without interfering with other proxy paths or general request flows.

This provides a more targeted fix while retaining the intended functionality.
