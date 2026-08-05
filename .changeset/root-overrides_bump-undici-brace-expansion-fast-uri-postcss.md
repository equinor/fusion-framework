---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-dev-server": patch
---

Internal: bump transitive dependencies bundled into these packages' build output via `pnpm.overrides` — `undici` (`<7.29.0`), `brace-expansion` (`<2.1.4`), `fast-uri` (`<3.1.5`), and `postcss` (`<=8.5.22`) — to resolve Dependabot security alerts. These packages bundle their dependency tree (rollup/vite build) and are therefore always changesetted for dependency changes, even when only the root lockfile resolution moves.
