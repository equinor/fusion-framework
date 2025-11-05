import { describe, it, expect, vi } from 'vitest';
import { SemVer } from 'semver';

// Mock the version first (hoisted)
vi.mock('../../version', () => ({
  version: '6.1.2-next.0+1493919587',
}));

import { resolveVersion } from '../../versioning/resolve-version';
import { MsalModuleVersion } from '../../static';

describe('resolveVersion', () => {
  describe('successful version resolution', () => {
    it('should resolve a valid version string', () => {
      const result = resolveVersion('2.1.0');

      expect(result).toMatchObject({
        wantedVersion: expect.any(SemVer),
        latestVersion: expect.any(SemVer),
        isLatest: false,
        satisfiesLatest: false, // 2.x is not compatible with 5.x
        enumVersion: MsalModuleVersion.V2,
      });

      expect(result.wantedVersion.version).toBe('2.1.0');
      expect(result.latestVersion.version).toBe('6.1.2');
    });

    it('should resolve with SemVer object', () => {
      const semver = new SemVer('2.0.0');
      const result = resolveVersion(semver);

      expect(result.wantedVersion).toBe(semver);
      expect(result.satisfiesLatest).toBe(false); // 2.x is not compatible with 5.x
    });

    it('should resolve latest version when no version provided', () => {
      const result = resolveVersion();

      expect(result.wantedVersion.version).toBe('6.1.2');
      expect(result.latestVersion.version).toBe('6.1.2');
      expect(result.isLatest).toBe(true);
      expect(result.satisfiesLatest).toBe(true);
    });

    it('should resolve latest version when empty string provided', () => {
      const result = resolveVersion('');

      expect(result.wantedVersion.version).toBe('6.1.2');
      expect(result.isLatest).toBe(true);
    });

    it('should find correct enum version for major version', () => {
      const result = resolveVersion('2.5.0');

      expect(result.enumVersion).toBe(MsalModuleVersion.V2);
      expect(result.satisfiesLatest).toBe(false); // 2.x is not compatible with 5.x
    });
  });

  describe('version comparison and warnings', () => {
    it('should identify version states correctly', () => {
      // Exact latest version
      expect(resolveVersion('6.1.2-next.0+1493919587').isLatest).toBe(true);

      // Patch difference (satisfies but not latest)
      const patchResult = resolveVersion('6.1.1');
      expect(patchResult.isLatest).toBe(false);
      expect(patchResult.satisfiesLatest).toBe(true);
      expect(patchResult.warnings).toBeUndefined();

      // Minor difference (satisfies)
      const minorResult = resolveVersion('6.0.0');
      expect(minorResult.isLatest).toBe(false);
      expect(minorResult.satisfiesLatest).toBe(true);

      // Major difference (doesn't satisfy)
      const majorResult = resolveVersion('7.0.0');
      expect(majorResult.satisfiesLatest).toBe(false);
    });

    it('should handle versions without matching enum with warnings', () => {
      // Lower major version - should map to V2
      const lowerResult = resolveVersion('3.0.0');
      expect(lowerResult.enumVersion).toBe(MsalModuleVersion.V2);
      expect(lowerResult.warnings).toBeDefined();
      expect(lowerResult.warnings?.[0]).toContain(
        'Requested major version 3 is behind the latest major version 6',
      );

      // Zero version - should map to V2
      const zeroResult = resolveVersion('0.0.0');
      expect(zeroResult.enumVersion).toBe(MsalModuleVersion.V2);
      expect(zeroResult.warnings).toBeDefined();
      expect(zeroResult.warnings?.[0]).toContain(
        'Requested major version 0 is behind the latest major version 6',
      );
    });
  });

  describe('error handling', () => {
    it('should handle invalid version strings gracefully', () => {
      const invalidVersions = ['invalid-version', 'not-a-version', 'invalid', 'bad.version'];

      invalidVersions.forEach((invalidVersion) => {
        const result = resolveVersion(invalidVersion);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings?.[0]).toContain(
          `Failed to parse requested version "${invalidVersion}"`,
        );
        // Should fall back to latest version (coerced)
        expect(result.wantedVersion.version).toBe('6.1.2');
      });
    });

    it('should handle malformed but coercible versions', () => {
      // semver.coerce handles these gracefully
      expect(() => resolveVersion('2.')).not.toThrow();
      expect(() => resolveVersion('4')).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle complex version strings with pre-release and build metadata', () => {
      const testCases = [
        { input: '6.1.2-next.0+1493919587-beta.1', expected: '6.1.2' },
        { input: '6.1.2-next.0+1493919587+build.123', expected: '6.1.2' },
        { input: '6.1.2-next.0+1493919587-beta.1.alpha.2+build.123.456', expected: '6.1.2' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = resolveVersion(input);
        expect(result.satisfiesLatest).toBe(true);
        expect(result.wantedVersion.version).toBe(expected);
      });
    });

    it('should return consistent structure across calls', () => {
      const result1 = resolveVersion('2.0.0');
      const result2 = resolveVersion('4.0.0');

      // Latest version should be consistent
      expect(result1.latestVersion.version).toBe(result2.latestVersion.version);
      expect(result1.latestVersion.version).toBe('6.1.2');

      // Structure should be consistent
      expect(result1).toHaveProperty('wantedVersion');
      expect(result1).toHaveProperty('latestVersion');
      expect(result1).toHaveProperty('isLatest');
      expect(result1).toHaveProperty('satisfiesLatest');
      expect(result1).toHaveProperty('enumVersion');

      expect(result1.wantedVersion).toBeInstanceOf(SemVer);
      expect(result1.latestVersion).toBeInstanceOf(SemVer);
      expect(typeof result1.isLatest).toBe('boolean');
      expect(typeof result1.satisfiesLatest).toBe('boolean');
      expect(typeof result1.enumVersion).toBe('string');
    });
  });
});
