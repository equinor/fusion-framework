import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom, take } from 'rxjs';
import { AppConfigurator } from '../AppConfigurator';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { SemanticVersion } from '@equinor/fusion-framework-module';

describe('AppConfigurator', () => {
  let configurator: AppConfigurator;

  // Create a mock module for testing
  const createMockModule = (name: string, version = '1.0.0'): AnyModule => ({
    name,
    version: new SemanticVersion(version),
    initialize: () => ({ mockInstance: true }),
  });

  // Mock environment object
  const mockEnv = {
    manifest: {
      appKey: 'test-app',
      displayName: 'Test App',
      description: 'A test application',
      type: 'standalone' as const,
      build: {
        version: '1.0.0',
        entryPoint: 'index.js',
      },
    },
  };

  beforeEach(() => {
    configurator = new AppConfigurator(mockEnv);
  });

  describe('Event Name Prefixing', () => {
    it('should prefix event names with "AppConfigurator::"', async () => {
      // Trigger event by adding a config
      configurator.addConfig({
        module: createMockModule('test', '1.0.0'),
        configure: () => {},
      });

      // Wait for the first event to be emitted
      const event = await firstValueFrom(configurator.event$.pipe(take(1)));

      expect(event.name).toMatch(/^AppConfigurator::/);
    });
  });
});
