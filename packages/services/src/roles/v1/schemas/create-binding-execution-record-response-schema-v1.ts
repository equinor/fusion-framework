import { z } from 'zod';

/** Zod schema for the identifier of a newly created binding execution record. */
export const CreateBindingExecutionRecordResponseSchemaV1 = z
  .object({
    /** The ID of the newly created execution record. */
    id: z.string().optional().describe('The ID of the newly created execution record.'),
  })
  .describe('The identifier of a newly created binding execution record.');

/**
 * Response model for creating a binding execution record.
 *
 * Roles API 1.0 model inferred from {@link CreateBindingExecutionRecordResponseSchemaV1}, so
 * `CreateBindingExecutionRecordResponseV1` and the runtime validator can never describe
 * different shapes.
 */
export type CreateBindingExecutionRecordResponseV1 = z.infer<
  typeof CreateBindingExecutionRecordResponseSchemaV1
>;
