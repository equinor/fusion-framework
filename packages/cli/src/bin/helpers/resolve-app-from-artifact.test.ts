import { describe, it, expect, beforeEach } from 'vitest';
import AdmZip from 'adm-zip';

import { resolveAppFromArtifact } from './resolve-app-from-artifact.js';

describe('resolveAppFromArtifact', () => {
  let mockBundle: AdmZip;

  beforeEach(() => {
    mockBundle = new AdmZip();
  });

  describe('happy path scenarios', () => {
    it('should resolve app information from valid bundle', async () => {
      // Arrange
      const metadata = { appKey: 'test-app', name: 'test-app', version: '1.0.0' };

      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act
      const result = await resolveAppFromArtifact(mockBundle);

      // Assert
      expect(result).toEqual({
        appKey: 'test-app',
        name: 'test-app',
        version: '1.0.0',
      });
    });

    it('should handle manifest with all optional fields', async () => {
      // Arrange
      const metadata = { appKey: 'complex-app', name: 'complex-app', version: '2.1.0' };

      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act
      const result = await resolveAppFromArtifact(mockBundle);

      // Assert
      expect(result.appKey).toBe('complex-app');
      expect(result.version).toBe('2.1.0');
    });
  });

  describe('error scenarios', () => {
    it('should throw error when metadata.json is missing', async () => {
      // Arrange - create empty bundle with no metadata.json

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'Metadata file not found in bundle',
      );
    });

    it('should throw error when metadata is missing appKey field', async () => {
      // Arrange
      const metadata = { name: 'test-app', version: '1.0.0' }; // missing appKey
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'App manifest is missing required appKey field',
      );
    });

    it('should throw error when metadata.json is invalid JSON', async () => {
      // Arrange
      mockBundle.addFile('metadata.json', Buffer.from('invalid json'));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'Failed to parse metadata file',
      );
    });

    it('should throw error when metadata has empty appKey field', async () => {
      // Arrange
      const metadata = { appKey: '', name: 'test-app', version: '1.0.0' }; // empty appKey
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'App manifest is missing required appKey field',
      );
    });

    it('should throw error when metadata has null appKey field', async () => {
      // Arrange
      const metadata = { appKey: null, name: 'test-app', version: '1.0.0' }; // null appKey
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'App manifest is missing required appKey field',
      );
    });

    it('should throw error when metadata has undefined appKey field', async () => {
      // Arrange
      const metadata = { appKey: undefined, name: 'test-app', version: '1.0.0' }; // undefined appKey
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'App manifest is missing required appKey field',
      );
    });

    it('should handle metadata with all required fields present', async () => {
      // Arrange
      const metadata = { appKey: 'complete-app', name: 'Complete App', version: '3.0.0' };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act
      const result = await resolveAppFromArtifact(mockBundle);

      // Assert
      expect(result.appKey).toBe('complete-app');
      expect(result.name).toBe('Complete App');
      expect(result.version).toBe('3.0.0');
    });

    it('should throw error when metadata has whitespace-only appKey field', async () => {
      // Arrange
      const metadata = { appKey: '   ', name: 'test-app', version: '1.0.0' }; // whitespace only
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'App manifest is missing required appKey field',
      );
    });

    it('should handle metadata with extra whitespace in appKey', async () => {
      // Arrange
      const metadata = { appKey: 'valid-app', name: 'test-app', version: '1.0.0' };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act
      const result = await resolveAppFromArtifact(mockBundle);

      // Assert
      expect(result.appKey).toBe('valid-app');
      expect(result.name).toBe('test-app');
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('edge cases', () => {
    it('should handle complex appKey values', async () => {
      // Arrange
      const metadata = {
        appKey: 'complex-app-key_123',
        name: 'Complex App',
        version: '1.2.3-beta.1',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act
      const result = await resolveAppFromArtifact(mockBundle);

      // Assert
      expect(result.appKey).toBe('complex-app-key_123');
      expect(result.name).toBe('Complex App');
      expect(result.version).toBe('1.2.3-beta.1');
    });

    it('should handle metadata with extra properties', async () => {
      // Arrange
      const metadata = {
        appKey: 'extra-props-app',
        name: 'Extra Props App',
        version: '2.0.0',
        extraProp: 'should be ignored',
        description: 'Should also be ignored',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act
      const result = await resolveAppFromArtifact(mockBundle);

      // Assert
      expect(result.appKey).toBe('extra-props-app');
      expect(result.name).toBe('Extra Props App');
      expect(result.version).toBe('2.0.0');
      // Extra properties should be preserved in the result
      expect(result).toHaveProperty('extraProp', 'should be ignored');
    });
  });
});
