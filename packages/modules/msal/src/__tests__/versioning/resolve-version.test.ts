import { describe, it, expect, vi } from 'vitest';
import { SemVer } from 'semver';
import { resolveVersion } from '../../versioning/resolve-version';

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

    it('should find correct enum version for major version', () => {
      const result = resolveVersion('2.5.0');

      expect(result.enumVersion).toBe(MsalModuleVersion.V2);
      expect(result.satisfiesLatest).toBe(false); // 2.x is not compatible with 4.x
    });
  });

  describe('version comparison and warnings', () => {
    it('should identify version states correctly', () => {
      // Exact latest version
      expect(resolveVersion('4.0.9').isLatest).toBe(true);

      // Patch difference (satisfies but not latest)
      const patchResult = resolveVersion('4.0.8');
      expect(patchResult.isLatest).toBe(false);
      expect(patchResult.satisfiesLatest).toBe(true);
      expect(patchResult.warnings).toBeUndefined();

      // Minor difference (satisfies with warning)
      const minorResult = resolveVersion('4.1.0');
      expect(minorResult.isLatest).toBe(false);
      expect(minorResult.satisfiesLatest).toBe(true);
      expect(minorResult.warnings).toBeDefined();
      expect(minorResult.warnings?.[0]).toContain('Requested minor version 1 is different from the latest minor version 0');

      // Major difference (doesn't satisfy with warning)
      const majorResult = resolveVersion('5.0.0');
      expect(majorResult.satisfiesLatest).toBe(false);
      expect(majorResult.warnings).toBeDefined();
      expect(majorResult.warnings?.[0]).toContain('Requested major version 5 is greater than the latest major version 4');
    });

    it('should handle versions without matching enum with warnings', () => {
      // Lower major version
      const lowerResult = resolveVersion('3.0.0');
      expect(lowerResult.enumVersion).toBe('4.0.9'); // Falls back to latest
      expect(lowerResult.warnings).toBeDefined();
      expect(lowerResult.warnings?.[0]).toContain('Requested major version 3 is behind the latest major version 4');

      // Zero version
      const zeroResult = resolveVersion('0.0.0');
      expect(zeroResult.enumVersion).toBe('4.0.9'); // Falls back to latest
      expect(zeroResult.warnings).toBeDefined();
      expect(zeroResult.warnings?.[0]).toContain('Requested major version 0 is behind the latest major version 4');
    });
  });

  describe('error handling', () => {
    it('should handle invalid version strings gracefully', () => {
      const invalidVersions = ['invalid-version', 'not-a-version', 'invalid', 'bad.version'];

      invalidVersions.forEach(invalidVersion => {
        const result = resolveVersion(invalidVersion);
        expect(result.warnings).toBeDefined();
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings?.[0]).toContain(`Failed to parse requested version "${invalidVersion}"`);
        // Should fall back to latest version
        expect(result.wantedVersion.version).toBe('4.0.9');
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
        { input: '4.0.9-beta.1', expected: '4.0.9' },
        { input: '4.0.9+build.123', expected: '4.0.9' },
        { input: '4.0.9-beta.1.alpha.2+build.123.456', expected: '4.0.9' },
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
      expect(result1.latestVersion.version).toBe('4.0.9');

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
