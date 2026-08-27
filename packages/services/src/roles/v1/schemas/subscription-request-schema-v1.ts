import { z } from 'zod';
import { ApiSubscriptionTypeSchemaV1 } from './api-subscription-type-schema-v1';

/** Zod schema for the body of a Roles V2 subscription request. */
export const SubscriptionRequestSchemaV1 = z
  .object({
    /** Existing subscription ID to renew. */
    id: z.string().nullish().describe('Existing subscription ID to renew.'),
    /** Human-readable subscription identifier. */
    identifier: z.string().nullish().describe('Human-readable subscription identifier.'),
    /** Subscription lifetime. */
    type: ApiSubscriptionTypeSchemaV1.optional().describe('Subscription lifetime.'),
    /** Event types to restrict the subscription to. */
    typeFilter: z
      .array(z.string())
      .nullish()
      .describe('Event types to restrict the subscription to.'),
  })
  .describe('The body of a Roles V2 subscription request.');

/**
 * Request body creating or renewing a Roles API 1.0 event subscription, optionally filtered to
 * specific event types.
 *
 * Roles API 1.0 model inferred from {@link SubscriptionRequestSchemaV1}, so
 * `SubscriptionRequestV1` and the runtime validator can never describe different shapes.
 */
export type SubscriptionRequestV1 = z.infer<typeof SubscriptionRequestSchemaV1>;
