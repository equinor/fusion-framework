# Version Management

The MSAL module includes built-in version checking to ensure compatibility between different MSAL library versions.

## Version Resolution

```typescript
import { resolveVersion, VersionError } from '@equinor/fusion-framework-module-msal/versioning';

// Resolve and validate a version
const result = resolveVersion('2.0.0');
console.log(result.isLatest); // false
console.log(result.satisfiesLatest); // true
console.log(result.enumVersion); // MsalModuleVersion.V2
```

## Version Checking Behavior

- **Major Version Incompatibility**: Throws `VersionError` if requested major version is greater than latest
- **Minor Version Mismatch**: Logs warning but allows execution
- **Patch Differences**: Ignored for compatibility
- **Invalid Versions**: Throws `VersionError` with descriptive message

## API Reference

### `resolveVersion(version: string | SemVer): ResolvedVersion`

Resolves and validates a version string against the latest available MSAL version.

**Parameters:**
- `version` - Version string or SemVer object to resolve

**Returns:** `ResolvedVersion` object containing:
- `wantedVersion: SemVer` - The parsed requested version
- `latestVersion: SemVer` - The latest available version
- `isLatest: boolean` - Whether the version is exactly the latest
- `satisfiesLatest: boolean` - Whether the major version matches latest
- `enumVersion: MsalModuleVersion` - Corresponding enum version

**Throws:** `VersionError` for invalid or incompatible versions

### `VersionError`

Error class for version-related issues with the following types:
- `InvalidVersion` - Requested version is not a valid semver
- `InvalidLatestVersion` - Latest version parsing failed (build issue)
- `MajorIncompatibility` - Major version is greater than latest
- `MinorMismatch` - Minor version differs (warning only)
- `PatchDifference` - Patch version differs (info only)
- `IncompatibleVersion` - General incompatibility

## Error Handling

```typescript
import { resolveVersion, VersionError } from '@equinor/fusion-framework-module-msal/versioning';

try {
  const result = resolveVersion('3.0.0'); // Assuming latest is 2.x
} catch (error) {
  if (error instanceof VersionError) {
    console.error('Version error:', error.message);
    console.error('Requested:', error.requestedVersion);
    console.error('Latest:', error.latestVersion);
    console.error('Type:', error.type);
  }
}
```
