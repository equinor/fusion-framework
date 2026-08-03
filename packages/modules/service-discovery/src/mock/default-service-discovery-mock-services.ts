import type { MockService } from './create-mock-service';

/**
 * Services a Fusion application resolves during a normal start-up.
 *
 * @remarks
 * Exported as the baseline so the mock works with no arguments for the common
 * case, and so a test can see — and extend — exactly which services the runtime
 * expects to be resolvable.
 *
 * @example Add a service without restating the baseline
 * ```typescript
 * new ServiceDiscoveryMockClient({ services: [{ key: 'my-service' }] });
 * ```
 */
export const defaultServiceDiscoveryMockServices: ReadonlyArray<MockService> = [
  { key: 'apps' },
  { key: 'people' },
  { key: 'context' },
  { key: 'bookmarks' },
  { key: 'notification' },
];
