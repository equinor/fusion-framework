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
  });

  describe('error scenarios', () => {
    it('should throw error when metadata.json is missing', async () => {
      // Arrange - create empty bundle with no metadata.json

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'Metadata file not found in bundle',
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

    it('should throw error when metadata is missing appKey field', async () => {
      // Arrange
      const metadata = { name: 'test-app', version: '1.0.0' }; // missing appKey
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'App manifest is missing required appKey field',
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

    it('should throw error when metadata has whitespace-only appKey field', async () => {
      // Arrange
      const metadata = { appKey: '   ', name: 'test-app', version: '1.0.0' }; // whitespace only
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'App manifest is missing required appKey field',
      );
    });
  });
});
