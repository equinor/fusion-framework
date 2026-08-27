import { z } from 'zod';

/** Zod schema for the identifier of a newly created binding notification record. */
export const CreateBindingNotificationRecordResponseSchemaV1 = z
  .object({
    /** The ID of the newly created notification record. */
    id: z.string().optional().describe('The ID of the newly created notification record.'),
  })
  .describe('The identifier of a newly created binding notification record.');

/**
 * Response model for creating a binding notification record.
 *
 * Roles API 1.0 model inferred from {@link CreateBindingNotificationRecordResponseSchemaV1}, so
 * `CreateBindingNotificationRecordResponseV1` and the runtime validator can never describe
 * different shapes.
 */
export type CreateBindingNotificationRecordResponseV1 = z.infer<
  typeof CreateBindingNotificationRecordResponseSchemaV1
>;
