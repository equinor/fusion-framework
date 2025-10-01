import { describe, it, expect, beforeEach } from 'vitest';
import { FrameworkConfigurator } from '../FrameworkConfigurator.js';
import type { ModuleEvent, AnyModule } from '@equinor/fusion-framework-module';
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
      const events: ModuleEvent[] = [];
      const subscription = configurator.event$.subscribe((event) => {
        events.push(event);
      });

      // Trigger an event by calling a method that registers events
      configurator.addConfig({
        module: createMockModule('test', '1.0.0'),
        configure: () => {
          // Empty configure function
        },
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      subscription.unsubscribe();

      expect(events.length).toBeGreaterThan(0);
      events.forEach((event) => {
        expect(event.name).toMatch(/^FrameworkConfigurator::/);
      });
    });

    it('should not double-prefix events that are already prefixed', async () => {
      // This test verifies that the prefixing logic doesn't create FrameworkConfigurator::FrameworkConfigurator::
      const events: ModuleEvent[] = [];
      const subscription = configurator.event$.subscribe((event) => {
        events.push(event);
      });

      // Trigger multiple events
      configurator.addConfig({
        module: createMockModule('test1', '1.0.0'),
        configure: () => {
          // Empty configure function
        },
      });

      configurator.addConfig({
        module: createMockModule('test2', '1.0.0'),
        configure: () => {
          // Empty configure function
        },
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      subscription.unsubscribe();

      // Check that no event has double prefixing
      events.forEach((event) => {
        const prefixCount = (event.name.match(/FrameworkConfigurator::/g) || []).length;
        expect(prefixCount).toBe(1); // Should only have one prefix
      });
    });
  });

  describe('Default Telemetry Configuration', () => {
    it('should apply default telemetry configuration with correct metadata and scope', async () => {
      let telemetryConfigurator: any = null;

      // Use onConfigured to capture the telemetry configurator before initialization
      configurator.onConfigured((config) => {
        telemetryConfigurator = config.telemetry;
      });

      // Configure the modules without initializing (this triggers onConfigured callbacks)
      await (configurator as any)._configure();

      // Verify the telemetry configurator was created and configured
      expect(telemetryConfigurator).toBeDefined();
      expect(telemetryConfigurator).toBeInstanceOf(Object);

      // Build the configuration to get the final config values
      const finalConfig = await telemetryConfigurator.createConfigAsync({
        hasModule: () => false,
        requireInstance: () => Promise.resolve(null),
        ref: undefined,
      });

      // Verify the telemetry configuration was applied correctly
      expect(finalConfig).toBeDefined();
      expect(finalConfig.metadata).toBeDefined();
      expect(typeof finalConfig.metadata).toBe('function');
      expect(finalConfig.defaultScope).toEqual(['framework']);

      // Get the actual metadata by calling the metadata function (which returns an observable)
      const metadataObservable = finalConfig.metadata();
      const metadata = await metadataObservable.toPromise();

      // Verify metadata structure and values
      expect(metadata).toHaveProperty('fusion');
      expect(metadata.fusion).toHaveProperty('type', 'framework-telemetry');
      expect(metadata.fusion).toHaveProperty('framework');
      expect(metadata.fusion.framework).toHaveProperty('version', '7.3.20');
    });
  });
});
