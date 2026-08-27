import { z } from 'zod';

/** Zod schema for a recorded binding notification event. */
export const ApiBindingNotificationRecordSchemaV1 = z
  .object({
    /** Unique identifier of the notification record. */
    id: z.string().optional().describe('Unique identifier of the notification record.'),
    /** Date and time the notification was received. */
    receivedAt: z.string().optional().describe('Date and time the notification was received.'),
    /** Binding type this notification relates to (e.g. "EntraGroup"). */
    bindingType: z
      .string()
      .optional()
      .describe('Binding type this notification relates to (e.g. "EntraGroup").'),
    /** The source system that sent the notification. */
    sourceSystem: z.string().optional().describe('The source system that sent the notification.'),
    /** Type of notification event. */
    notificationType: z.string().optional().describe('Type of notification event.'),
    /** Result of processing the notification (e.g. "Processed", "Ignored"). */
    processingResult: z
      .string()
      .optional()
      .describe('Result of processing the notification (e.g. "Processed", "Ignored").'),
    /** Error message if processing failed, if any. */
    errorMessage: z.string().nullish().describe('Error message if processing failed, if any.'),
    /** Additional JSON metadata about the notification, if any. */
    metadata: z
      .string()
      .nullish()
      .describe('Additional JSON metadata about the notification, if any.'),
  })
  .describe('A recorded binding notification event.');

/**
 * Represents a recorded notification event received from an external binding source.
 *
 * Roles API 1.0 model inferred from {@link ApiBindingNotificationRecordSchemaV1}, so
 * `ApiBindingNotificationRecordV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiBindingNotificationRecordV1 = z.infer<typeof ApiBindingNotificationRecordSchemaV1>;
