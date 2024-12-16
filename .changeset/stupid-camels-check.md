---
'@equinor/fusion-framework-module-app': patch
---

Reverting update to the `manifests` call `selector` function in `AppClient` to use `jsonSelector` and parse the response with `ApplicationSchema`.

**Modified files:**
- `packages/modules/app/src/AppClient.ts`

**Changes:**
- Replaced `res.json()` with `jsonSelector(res)`
- Parsed the response using `ApplicationSchema.array().parse(response.value)`
