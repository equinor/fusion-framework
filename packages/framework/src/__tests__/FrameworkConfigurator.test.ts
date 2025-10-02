import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom, take } from 'rxjs';
import { FrameworkConfigurator } from '../FrameworkConfigurator.js';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { SemanticVersion } from '@equinor/fusion-framework-module';

describe('FrameworkConfigurator', () => {
  let configurator: FrameworkConfigurator;

  // Create a mock module for testing
  const createMockModule = (name: string, version = '1.0.0'): AnyModule => ({
    name,
    version: new SemanticVersion(version),
    initialize: () => ({ mockInstance: true }),
  });

  beforeEach(() => {
    configurator = new FrameworkConfigurator();
  });

  describe('Event Name Prefixing', () => {
    it('should prefix event names with "FrameworkConfigurator::"', async () => {
      // Trigger event by adding a config
      configurator.addConfig({
        module: createMockModule('test', '1.0.0'),
        configure: () => {},
      });

      // Wait for the first event to be emitted
      const event = await firstValueFrom(configurator.event$.pipe(take(1)));

      expect(event.name).toMatch(/^FrameworkConfigurator::/);
    });
  });
});
