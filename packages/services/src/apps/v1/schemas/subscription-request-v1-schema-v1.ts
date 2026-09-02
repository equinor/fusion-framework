import { z } from 'zod';
import { ApiSubscriptionTypeSchemaV1 } from './api-subscription-type-schema-v1';

/**
 * Zod schema for the `SubscriptionRequestV1` model published by the Fusion Apps API 1.0.
 *
 * The body of a request registering a Fusion Apps event subscription.
 */
export const SubscriptionRequestV1SchemaV1 = z
  .object({
    /** Identifier of an existing subscription to replace. */
    id: z.string().nullish().describe('Identifier of an existing subscription to replace.'),
    /** Identifier of the subscriber receiving the events. */
    identifier: z.string().nullish().describe('Identifier of the subscriber receiving the events.'),
    /** Lifetime of the subscription. */
    type: ApiSubscriptionTypeSchemaV1.optional().describe('Lifetime of the subscription.'),
    /** Event types the subscription is limited to. */
    typeFilter: z
      .array(z.string())
      .nullish()
      .describe('Event types the subscription is limited to.'),
  })
  .describe('The body of a request registering a Fusion Apps event subscription.');

/**
 * The body of a request registering a Fusion Apps event subscription.
 *
 * Apps API 1.0 model inferred from {@link SubscriptionRequestV1SchemaV1}, so
 * `SubscriptionRequestV1V1` and the runtime validator can never describe different shapes.
 */
export type SubscriptionRequestV1V1 = z.infer<typeof SubscriptionRequestV1SchemaV1>;
