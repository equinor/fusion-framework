import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdmZip from 'adm-zip';

import { resolveAppFromArtifact } from './resolve-app-from-artifact.js';
import type { AppManifest } from '@equinor/fusion-framework-module-app';

describe('resolveAppFromArtifact', () => {
  let mockBundle: AdmZip;

  beforeEach(() => {
    mockBundle = new AdmZip();
  });

  describe('happy path scenarios', () => {
    it('should resolve app information from valid bundle', async () => {
      // Arrange
      const metadata = { name: 'test-app', version: '1.0.0' };
      const manifest: AppManifest = {
        appKey: 'test-app',
        displayName: 'Test App',
        description: 'A test application',
        type: 'standalone',
      };

      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act
      const result = await resolveAppFromArtifact(mockBundle);

      // Assert
      expect(result).toEqual({
        appKey: 'test-app',
        name: 'test-app',
        version: '1.0.0',
        manifest,
      });
    });

    it('should handle manifest with all optional fields', async () => {
      // Arrange
      const metadata = { name: 'complex-app', version: '2.1.0' };
      const manifest: AppManifest = {
        appKey: 'complex-app',
        displayName: 'Complex Test App',
        description: 'A complex test application with all fields',
        type: 'standalone',
        isPinned: true,
        keywords: ['test', 'complex'],
        category: {
          id: 'test',
          name: 'test-category',
          displayName: 'Test Category',
          color: '#FF0000',
          defaultIcon: 'test-icon',
          sortOrder: 1,
        },
        visualization: {
          color: '#00FF00',
          icon: 'app-icon',
          sortOrder: 5,
        },
        build: {
          version: '2.1.0',
          entryPoint: 'index.js',
          tag: 'latest',
        },
      };

      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act
      const result = await resolveAppFromArtifact(mockBundle);

      // Assert
      expect(result.appKey).toBe('complex-app');
      expect(result.manifest.build?.version).toBe('2.1.0');
      expect(result.manifest.category?.displayName).toBe('Test Category');
    });
  });

  describe('error scenarios', () => {
    it('should throw error when metadata.json is missing', async () => {
      // Arrange
      const manifest: AppManifest = {
        appKey: 'test-app',
        displayName: 'Test App',
        description: 'A test application',
        type: 'standalone',
      };
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'Metadata file (metadata.json) not found in bundle. This file is required for artifact-based validation.',
      );
    });

    it('should throw error when app-manifest.json is missing', async () => {
      // Arrange
      const metadata = { name: 'test-app', version: '1.0.0' };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'App manifest file (app-manifest.json) not found in bundle. This file is required for artifact-based validation.',
      );
    });

    it('should throw error when metadata.json is invalid JSON', async () => {
      // Arrange
      mockBundle.addFile('metadata.json', Buffer.from('invalid json'));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'Failed to parse metadata.json file',
      );
    });

    it('should throw error when app-manifest.json is invalid JSON', async () => {
      // Arrange
      const metadata = { name: 'test-app', version: '1.0.0' };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from('invalid json'));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'Failed to parse app-manifest.json file',
      );
    });

    it('should throw error when metadata.json is missing name field', async () => {
      // Arrange
      const metadata = { version: '1.0.0' }; // missing name
      const manifest: AppManifest = {
        appKey: 'test-app',
        displayName: 'Test App',
        description: 'A test application',
        type: 'standalone',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'metadata.json is missing required "name" field',
      );
    });

    it('should throw error when metadata.json is missing version field', async () => {
      // Arrange
      const metadata = { name: 'test-app' }; // missing version
      const manifest: AppManifest = {
        appKey: 'test-app',
        displayName: 'Test App',
        description: 'A test application',
        type: 'standalone',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'metadata.json is missing required "version" field',
      );
    });

    it('should throw error when app-manifest.json is missing appKey field', async () => {
      // Arrange
      const metadata = { name: 'test-app', version: '1.0.0' };
      const manifest = {
        // missing appKey
        displayName: 'Test App',
        description: 'A test application',
        type: 'standalone',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'app-manifest.json is missing required "appKey" field',
      );
    });

    it('should throw error when app-manifest.json is missing displayName field', async () => {
      // Arrange
      const metadata = { name: 'test-app', version: '1.0.0' };
      const manifest = {
        appKey: 'test-app',
        // missing displayName
        description: 'A test application',
        type: 'standalone',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'app-manifest.json is missing required "displayName" field',
      );
    });

    it('should throw error when appKey is not extracted from manifest', async () => {
      // Arrange
      const metadata = { name: 'test-app', version: '1.0.0' };
      const manifest: Partial<AppManifest> = {
        appKey: '', // empty appKey
        displayName: 'Test App',
        description: 'A test application',
        type: 'standalone',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'app-manifest.json is missing required "appKey" field',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle name and version as numbers in metadata (convert to string)', async () => {
      // Arrange
      const metadata = {
        name: 123 as unknown as string, // type coercion for test
        version: 456 as unknown as string, // type coercion for test
      };
      const manifest: AppManifest = {
        appKey: 'test-app',
        displayName: 'Test App',
        description: 'A test application',
        type: 'standalone',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'metadata.json is missing required "name" field',
      );
    });

    it('should handle null values in required fields', async () => {
      // Arrange
      const metadata = { name: null, version: '1.0.0' };
      const manifest: AppManifest = {
        appKey: 'test-app',
        displayName: 'Test App',
        description: 'A test application',
        type: 'standalone',
      };
      mockBundle.addFile('metadata.json', Buffer.from(JSON.stringify(metadata)));
      mockBundle.addFile('app-manifest.json', Buffer.from(JSON.stringify(manifest)));

      // Act & Assert
      await expect(resolveAppFromArtifact(mockBundle)).rejects.toThrow(
        'metadata.json is missing required "name" field',
      );
    });
  });
});
