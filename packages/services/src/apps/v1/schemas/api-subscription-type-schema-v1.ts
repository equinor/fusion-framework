import { z } from 'zod';

/**
 * Zod schema for the `ApiSubscriptionType` model published by the Fusion Apps API 1.0.
 *
 * The lifetime of a Fusion Apps event subscription.
 */
export const ApiSubscriptionTypeSchemaV1 = z
  .enum(['Transient', 'Persistent'])
  .describe('The lifetime of a Fusion Apps event subscription.');

/**
 * The lifetime of a Fusion Apps event subscription.
 *
 * Apps API 1.0 model inferred from {@link ApiSubscriptionTypeSchemaV1}, so `ApiSubscriptionTypeV1`
 * and the runtime validator can never describe different shapes.
 */
export type ApiSubscriptionTypeV1 = z.infer<typeof ApiSubscriptionTypeSchemaV1>;
