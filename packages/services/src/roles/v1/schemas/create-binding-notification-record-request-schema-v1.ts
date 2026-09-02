import { z } from 'zod';

/** Zod schema for the body of a create-binding-notification-record request. */
export const CreateBindingNotificationRecordRequestSchemaV1 = z
  .object({
    /** Date and time the notification was received. The API rejects future timestamps. */
    receivedAt: z
      .string()
      .optional()
      .describe('Date and time the notification was received. The API rejects future timestamps.'),
    /** Type of notification event. */
    notificationType: z.string().optional().describe('Type of notification event.'),
    /** Result of processing the notification, for example `Processed` or `Ignored`. */
    processingResult: z
      .string()
      .optional()
      .describe('Result of processing the notification, for example `Processed` or `Ignored`.'),
    /** Error message recorded when processing failed. */
    errorMessage: z.string().nullish().describe('Error message recorded when processing failed.'),
    /** JSON metadata about the notification. */
    metadata: z.string().nullish().describe('JSON metadata about the notification.'),
  })
  .describe('The body of a create-binding-notification-record request.');

/**
 * Request body for recording a binding notification event received from an external source.
 *
 * Roles API 1.0 model inferred from {@link CreateBindingNotificationRecordRequestSchemaV1}, so
 * `CreateBindingNotificationRecordRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type CreateBindingNotificationRecordRequestV1 = z.infer<
  typeof CreateBindingNotificationRecordRequestSchemaV1
>;
