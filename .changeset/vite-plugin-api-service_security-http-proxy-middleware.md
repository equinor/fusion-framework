---
"@equinor/fusion-framework-vite-plugin-api-service": patch
---

Bump `http-proxy-middleware` from `^4.0.0` to `^4.1.1` to address two security advisories:

- **HIGH** [GHSA-xxx]: multipart/form-data field injection vulnerability (fix: `>=4.1.1`)
- **MODERATE** [GHSA-xxx]: `router` host+path substring matching bypass (fix: `>=4.1.0`)

No API changes. This is a transitive security patch with no consumer impact.
