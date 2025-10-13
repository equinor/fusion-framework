---
"portal": patch
---

Downgrade React version from 19.2.0 to 18.2.0 to maintain compatibility with EDS components used in other packages.

- Updated dependencies and devDependencies in package.json
- Ensures consistent React version across the monorepo
- Fixes build failures caused by type compatibility issues
