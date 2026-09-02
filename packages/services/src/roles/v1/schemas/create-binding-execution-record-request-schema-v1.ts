import { z } from 'zod';

/** Zod schema for the body of a create-binding-execution-record request. */
export const CreateBindingExecutionRecordRequestSchemaV1 = z
  .object({
    /** Date and time the execution ran. The API rejects future timestamps. */
    executedAt: z
      .string()
      .optional()
      .describe('Date and time the execution ran. The API rejects future timestamps.'),
    /** What triggered the execution, for example `Scheduled` or `Manual`. */
    triggerType: z
      .string()
      .optional()
      .describe('What triggered the execution, for example `Scheduled` or `Manual`.'),
    /** Outcome of the execution, for example `Success` or `Failed`. */
    outcome: z
      .string()
      .optional()
      .describe('Outcome of the execution, for example `Success` or `Failed`.'),
    /** Error message recorded when the execution failed. */
    errorMessage: z
      .string()
      .nullish()
      .describe('Error message recorded when the execution failed.'),
    /** Names of roles affected during this execution. */
    rolesAffected: z
      .array(z.string())
      .optional()
      .describe('Names of roles affected during this execution.'),
    /** Names of claimable roles affected during this execution. */
    claimableRolesAffected: z
      .array(z.string())
      .optional()
      .describe('Names of claimable roles affected during this execution.'),
    /** IDs of users who received assignments during this execution. */
    assignedUserIds: z
      .array(z.string())
      .optional()
      .describe('IDs of users who received assignments during this execution.'),
    /** IDs of users whose assignments were removed during this execution. */
    removedUserIds: z
      .array(z.string())
      .optional()
      .describe('IDs of users whose assignments were removed during this execution.'),
    /** JSON metadata about the execution. */
    metadata: z.string().nullish().describe('JSON metadata about the execution.'),
  })
  .describe('The body of a create-binding-execution-record request.');

/**
 * Request body for recording a role binding execution run.
 *
 * Roles API 1.0 model inferred from {@link CreateBindingExecutionRecordRequestSchemaV1}, so
 * `CreateBindingExecutionRecordRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type CreateBindingExecutionRecordRequestV1 = z.infer<
  typeof CreateBindingExecutionRecordRequestSchemaV1
>;
