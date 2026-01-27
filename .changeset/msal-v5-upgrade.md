---
'@equinor/fusion-framework-module-msal': major
---

Upgrade @azure/msal-browser from v2.39.0 to v5.0.2

**Changes:**
- Updated MSAL browser dependency to v5.0.2
- Added V5 to MsalModuleVersion enum for version detection
- Updated version mapping logic to handle MSAL v5.x (maps to V5)
- Created v4 compatibility layer with frozen type snapshots from MSAL v5
- Fixed internal logger calls to include required correlationId parameter
- Added v4 export to package.json for consumers needing v4-compatible types

**Breaking changes:**
None - all changes are internal. Consumer API remains unchanged and fully backward compatible.

**Migration:**
No action required. The module automatically detects and uses MSAL v5 when available, while maintaining compatibility with existing code through version proxies.
