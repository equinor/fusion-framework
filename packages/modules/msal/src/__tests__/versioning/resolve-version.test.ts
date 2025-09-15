import { describe, it, expect, vi } from 'vitest';
import { SemVer } from 'semver';
import { resolveVersion } from '../../versioning/resolve-version';
import { VersionError } from '../../versioning/VersionError';

// Mock the static module to avoid test failures when package version changes
// This ensures tests remain stable regardless of package.json version bumps
vi.mock('../../static', () => ({
  MsalModuleVersion: {
    V2: 'v2',
    Latest: '4.0.9', // Fixed version for consistent testing
  },
}));

// Import the mocked version
import { MsalModuleVersion } from '../../static';

describe('resolveVersion', () => {
  describe('mock verification', () => {
    it('should use mocked version for consistent testing', () => {
      // Verify that our mock is working and we're using the fixed version
      expect(MsalModuleVersion.Latest).toBe('4.0.9');
      expect(MsalModuleVersion.V2).toBe('v2');
    });
  });

  describe('successful version resolution', () => {
    it('should resolve a valid version string', () => {
      const result = resolveVersion('2.1.0');

      expect(result).toMatchObject({
        wantedVersion: expect.any(SemVer),
        latestVersion: expect.any(SemVer),
        isLatest: false,
        satisfiesLatest: false, // 2.x is not compatible with 4.x
        enumVersion: MsalModuleVersion.V2,
      });

      expect(result.wantedVersion.version).toBe('2.1.0');
      expect(result.latestVersion.version).toBe('4.0.9');
    });

    it('should resolve with SemVer object', () => {
      const semver = new SemVer('2.0.0');
      const result = resolveVersion(semver);

      expect(result.wantedVersion).toBe(semver);
      expect(result.satisfiesLatest).toBe(false); // 2.x is not compatible with 4.x
    });

    it('should resolve latest version when no version provided', () => {
      const result = resolveVersion();

      expect(result.wantedVersion.version).toBe('4.0.9');
      expect(result.latestVersion.version).toBe('4.0.9');
      expect(result.isLatest).toBe(true);
      expect(result.satisfiesLatest).toBe(true);
    });

    it('should resolve latest version when empty string provided', () => {
      const result = resolveVersion('');

      expect(result.wantedVersion.version).toBe('4.0.9');
      expect(result.isLatest).toBe(true);
    });

    it('should handle patch version differences without warnings', () => {
      const result = resolveVersion('4.0.8');

      expect(result.satisfiesLatest).toBe(true);
      expect(result.isLatest).toBe(false);
      expect(result.warnings).toBeUndefined();
    });

    it('should handle minor version differences with warnings', () => {
      const result = resolveVersion('4.1.0');

      expect(result.satisfiesLatest).toBe(true);
      expect(result.isLatest).toBe(false);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0]).toContain('Minor version mismatch');
    });

    it('should find correct enum version for major version', () => {
      const result = resolveVersion('2.5.0');

      expect(result.enumVersion).toBe(MsalModuleVersion.V2);
      expect(result.satisfiesLatest).toBe(false); // 2.x is not compatible with 4.x
    });

    it('should throw error when no matching major version exists in enum', () => {
      // Version 3.0.0 should throw because there's no enum for major version 3
      expect(() => resolveVersion('3.0.0')).toThrow(VersionError);
    });
  });

  describe('error handling', () => {
    it('should throw VersionError for invalid version string', () => {
      expect(() => resolveVersion('invalid-version')).toThrow(VersionError);
    });

    it('should not throw for malformed version (coerce handles it)', () => {
      // semver.coerce('2.') returns '2.0.0', so it doesn't throw
      expect(() => resolveVersion('2.')).not.toThrow();
    });

    it('should throw VersionError for non-semver string', () => {
      expect(() => resolveVersion('not-a-version')).toThrow(VersionError);
    });

    it('should throw VersionError for major version incompatibility', () => {
      expect(() => resolveVersion('5.0.0')).toThrow(VersionError);
    });

    it('should throw VersionError for very high major version', () => {
      expect(() => resolveVersion('999.0.0')).toThrow(VersionError);
    });

    it('should include correct error type for major incompatibility', () => {
      try {
        resolveVersion('5.0.0');
        expect.fail('Should have thrown VersionError');
      } catch (error) {
        expect(error).toBeInstanceOf(VersionError);
        const versionError = error as VersionError;
        expect(versionError.type).toBe('major-incompatibility');
        expect(versionError.requestedVersion).toBe('5.0.0');
        expect(versionError.latestVersion).toBe('4.0.9');
      }
    });

    it('should include correct error type for invalid version', () => {
      try {
        resolveVersion('invalid');
        expect.fail('Should have thrown VersionError');
      } catch (error) {
        expect(error).toBeInstanceOf(VersionError);
        expect((error as VersionError).type).toBe('invalid-version');
      }
    });
  });

  describe('version comparison logic', () => {
    it('should correctly identify latest version', () => {
      const result = resolveVersion('4.0.9');
      expect(result.isLatest).toBe(true);
    });

    it('should correctly identify non-latest version', () => {
      const result = resolveVersion('4.0.8');
      expect(result.isLatest).toBe(false);
    });

    it('should correctly identify satisfying version', () => {
      const result = resolveVersion('4.1.0');
      expect(result.satisfiesLatest).toBe(true);
    });

    it('should correctly identify non-satisfying version', () => {
      expect(() => resolveVersion('5.0.0')).toThrow();
    });

    it('should throw error for major versions without enum values', () => {
      // Version 3.0.0 should throw because there's no enum for major version 3
      expect(() => resolveVersion('3.0.0')).toThrow(VersionError);
    });
  });

  describe('warning behavior', () => {
    it('should warn on minor version mismatch', () => {
      const result = resolveVersion('4.1.0');

      expect(result.warnings).toBeDefined();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0]).toContain('Minor version mismatch');
    });

    it('should not warn on patch version differences', () => {
      const result = resolveVersion('4.0.8');

      expect(result.warnings).toBeUndefined();
    });

    it('should not warn on exact version match', () => {
      const result = resolveVersion('4.0.9');

      expect(result.warnings).toBeUndefined();
    });

    it('should warn with correct version information', () => {
      const result = resolveVersion('4.2.0');

      expect(result.warnings).toBeDefined();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0]).toContain('4.2.0');
      expect(result.warnings?.[0]).toContain('4.0.9');
    });
  });

  describe('edge cases', () => {
    it('should handle version with pre-release identifiers (coerce strips them)', () => {
      const result = resolveVersion('4.0.9-beta.1');

      expect(result.satisfiesLatest).toBe(true);
      expect(result.wantedVersion.version).toBe('4.0.9'); // coerce strips pre-release
    });

    it('should handle version with build metadata (coerce strips them)', () => {
      const result = resolveVersion('4.0.9+build.123');

      expect(result.satisfiesLatest).toBe(true);
      expect(result.wantedVersion.version).toBe('4.0.9'); // coerce strips build metadata
    });

    it('should handle very long version strings (coerce strips them)', () => {
      const longVersion = '4.0.9-beta.1.alpha.2+build.123.456';
      const result = resolveVersion(longVersion);

      expect(result.satisfiesLatest).toBe(true);
      expect(result.wantedVersion.version).toBe('4.0.9'); // coerce strips pre-release and build
    });

    it('should throw error for zero versions without enum values', () => {
      // Version 0.0.0 should throw because there's no enum for major version 0
      expect(() => resolveVersion('0.0.0')).toThrow(VersionError);
    });
  });

  describe('return value structure', () => {
    it('should return object with all required properties', () => {
      const result = resolveVersion('2.1.0');

      expect(result).toHaveProperty('wantedVersion');
      expect(result).toHaveProperty('latestVersion');
      expect(result).toHaveProperty('isLatest');
      expect(result).toHaveProperty('satisfiesLatest');
      expect(result).toHaveProperty('enumVersion');

      expect(typeof result.isLatest).toBe('boolean');
      expect(typeof result.satisfiesLatest).toBe('boolean');
      expect(result.wantedVersion).toBeInstanceOf(SemVer);
      expect(result.latestVersion).toBeInstanceOf(SemVer);
      expect(typeof result.enumVersion).toBe('string');
    });

    it('should have consistent latest version across calls', () => {
      const result1 = resolveVersion('2.0.0');
      const result2 = resolveVersion('4.0.0');

      expect(result1.latestVersion.version).toBe(result2.latestVersion.version);
      expect(result1.latestVersion.version).toBe('4.0.9');
    });
  });
});
