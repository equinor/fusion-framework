---
"@equinor/fusion-framework-cli-plugin-ai-mcp": patch
---

fix(security): address hono prototype pollution (GHSA-v8w9-8mx6-g223)

Upgrade hono from 4.12.5 to 4.12.8 to fix prototype pollution vulnerability in parseBody({ dot: true }). The vulnerability allowed specially crafted form field names like `__proto__.x` to potentially enable prototype pollution if parsed data was later merged unsafely. This is a non-breaking security patch.

**Advisory**: GHSA-v8w9-8mx6-g223 (Moderate, CVSS 4.8)
**Fixed in**: hono 4.12.8
