// @vitest-environment happy-dom
import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { TelemetryModule } from '@equinor/fusion-framework-module-telemetry';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerServiceWorker } from '../src/html/register-service-worker.js';

type MockMeasurement = {
  clone: ReturnType<typeof vi.fn>;
  measure: ReturnType<typeof vi.fn>;
  resolve: ReturnType<typeof vi.fn>;
};

/**
 * Creates a telemetry measurement mock without `Symbol.dispose` to verify
 * Safari/WebKit cleanup relies on explicit `measure()` calls rather than `using`.
 *
 * @param measureImpl - Optional custom implementation for `measure()`.
 * @returns Mock measurement object matching the subset used by `registerServiceWorker`.
 */
function createMockMeasurement(measureImpl?: () => number): MockMeasurement {
  const measurement: MockMeasurement = {
    measure: vi.fn(measureImpl ?? (() => 1)),
    resolve: vi.fn(async <T>(promise: Promise<T>) => await promise),
    clone: vi.fn(),
  };
  measurement.clone.mockReturnValue(measurement);
  return measurement;
}

/**
 * Creates a minimal framework stub with telemetry and auth mocks for service worker registration.
 *
 * @param measurement - Measurement instance returned by `telemetry.measure()`.
 * @returns Framework stub and `trackException` spy.
 */
function createFrameworkStub(measurement: MockMeasurement): {
  framework: ModulesInstance<[MsalModule, TelemetryModule]>;
  trackException: ReturnType<typeof vi.fn>;
} {
  const trackException = vi.fn();
  // Narrow test double only implements the telemetry and auth methods exercised by registerServiceWorker.
  const framework = {
    telemetry: {
      measure: vi.fn(() => measurement),
      trackException,
    },
    auth: {
      acquireToken: vi.fn(),
    },
  } as unknown as ModulesInstance<[MsalModule, TelemetryModule]>;
  return { framework, trackException };
}

/**
 * Installs a mocked `navigator.serviceWorker` container on the happy-dom navigator.
 *
 * @param overrides - Partial service worker container properties to override defaults.
 */
function mockServiceWorkerContainer(overrides: Partial<ServiceWorkerContainer>): void {
  // Partial registration stub only needs `active` for the ready promise resolution.
  const defaultReady = { active: null } as unknown as ServiceWorkerRegistration;
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      startMessages: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      register: vi.fn(),
      ready: Promise.resolve(defaultReady),
      controller: null,
      ...overrides,
    },
  });
}

describe('registerServiceWorker measurement lifecycle', () => {
  beforeEach(() => {
    vi.stubEnv('FUSION_SPA_SERVICE_WORKER_RESOURCES', '[]');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('records the measurement on successful registration without Symbol.dispose', async () => {
    const measurement = createMockMeasurement();
    const { framework, trackException } = createFrameworkStub(measurement);
    // Minimal ServiceWorker stub only needs postMessage to verify INIT_CONFIG delivery.
    const activeWorker = { postMessage: vi.fn() } as unknown as ServiceWorker;
    // Partial registration stub exposes the active worker returned by navigator.serviceWorker.ready.
    const readyRegistration = { active: activeWorker } as unknown as ServiceWorkerRegistration;

    mockServiceWorkerContainer({
      register: vi.fn().mockResolvedValue({}),
      ready: Promise.resolve(readyRegistration),
      controller: activeWorker,
    });

    await registerServiceWorker(framework);

    expect(activeWorker.postMessage).toHaveBeenCalledWith({
      type: 'INIT_CONFIG',
      config: '[]',
    });
    expect(measurement.measure).toHaveBeenCalledTimes(1);
    expect(trackException).not.toHaveBeenCalled();
  });

  it('records the measurement when exiting early without an active service worker', async () => {
    const measurement = createMockMeasurement();
    const { framework } = createFrameworkStub(measurement);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Partial registration stub simulates a ready registration with no active worker.
    const readyRegistration = { active: null } as unknown as ServiceWorkerRegistration;

    mockServiceWorkerContainer({
      register: vi.fn().mockResolvedValue({}),
      ready: Promise.resolve(readyRegistration),
    });

    await registerServiceWorker(framework);

    expect(errorSpy).toHaveBeenCalled();
    expect(measurement.measure).toHaveBeenCalledTimes(1);
  });

  it('records the measurement and tracks the exception when registration rejects', async () => {
    const measurement = createMockMeasurement(() => {
      throw new Error('telemetry unavailable');
    });
    const { framework, trackException } = createFrameworkStub(measurement);
    const registrationError = new Error('SW registration failed');

    mockServiceWorkerContainer({
      register: vi.fn().mockRejectedValue(registrationError),
    });

    await expect(registerServiceWorker(framework)).resolves.toBeUndefined();

    expect(measurement.measure).toHaveBeenCalledTimes(1);
    expect(trackException).toHaveBeenCalledWith({
      name: 'registerServiceWorker.Error',
      exception: registrationError,
    });
  });
});
