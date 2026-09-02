import { z } from 'zod';

/** Zod schema for the lifetime of a Roles V2 event subscription. */
export const ApiSubscriptionTypeSchemaV1 = z
  .enum(['Transient', 'Persistent'])
  .describe('The lifetime of a Roles V2 event subscription.');

/**
 * Lifetime of a Roles API 1.0 event subscription: `Transient` expires on its own, `Persistent`
 * is kept until it is removed.
 *
 * Roles API 1.0 model inferred from {@link ApiSubscriptionTypeSchemaV1}, so
 * `ApiSubscriptionTypeV1` and the runtime validator can never describe different shapes.
 */
export type ApiSubscriptionTypeV1 = z.infer<typeof ApiSubscriptionTypeSchemaV1>;
