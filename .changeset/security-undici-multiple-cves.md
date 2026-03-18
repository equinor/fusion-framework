---
"@equinor/fusion-framework": patch
"@equinor/fusion-framework-cli-plugin-ai-chat": patch
"@equinor/fusion-framework-cli-plugin-ai-index": patch
"@equinor/fusion-framework-cli-plugin-ai-mcp": patch
"@equinor/fusion-framework-react-app": patch
"@equinor/fusion-framework-app": patch
---

fix(security): address undici multiple vulnerabilities (CVE-2026-1524, 1527, 1528, 2581)

Upgrade undici from 7.22.0 to 7.24.3 to fix multiple security vulnerabilities affecting WebSocket parsing, HTTP header validation, and request deduplication:

- **CVE-2026-1528** (HIGH): WebSocket 64-bit length integer overflow causing process crash
- **CVE-2026-1524** (MODERATE): HTTP/1.1 response field header injection
- **CVE-2026-1527** (MODERATE): CRLF injection via upgrade option enabling protocol smuggling
- **CVE-2026-2581** (MODERATE): Unbounded memory consumption in deduplication handler

These are non-breaking security patches that harden undici against untrusted upstream endpoints and malicious WebSocket frames.

**Advisories**: GHSA-f269-vfmq-vjvj, GHSA-v9p9-hfj2-hcw8, GHSA-4992-7rv2-5pvq, GHSA-phc3-fgpg-7m6h
**Fixed in**: undici 7.24.0+ (deployed 7.24.3)
