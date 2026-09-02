import { z } from 'zod';

/** Zod schema for a recorded role binding reconciliation run. */
export const ApiBindingExecutionRecordSchemaV1 = z
  .object({
    /** Unique identifier of the execution record. */
    id: z.string().optional().describe('Unique identifier of the execution record.'),
    /** Date and time the execution ran. */
    executedAt: z.string().optional().describe('Date and time the execution ran.'),
    /** Binding type that was executed (e.g. "EntraGroup" or "OrgChart"). */
    bindingType: z
      .string()
      .optional()
      .describe('Binding type that was executed (e.g. "EntraGroup" or "OrgChart").'),
    /** The source system that triggered the execution. */
    sourceSystem: z.string().optional().describe('The source system that triggered the execution.'),
    /** What triggered the execution (e.g. "Scheduled", "Manual"). */
    triggerType: z
      .string()
      .optional()
      .describe('What triggered the execution (e.g. "Scheduled", "Manual").'),
    /** Outcome of the execution (e.g. "Success", "Failed"). */
    outcome: z.string().optional().describe('Outcome of the execution (e.g. "Success", "Failed").'),
    /** Error message if the execution failed, if any. */
    errorMessage: z.string().nullish().describe('Error message if the execution failed, if any.'),
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
    /** IDs of users who received role assignments during this execution. */
    assignedUserIds: z
      .array(z.string())
      .optional()
      .describe('IDs of users who received role assignments during this execution.'),
    /** IDs of users whose role assignments were removed during this execution. */
    removedUserIds: z
      .array(z.string())
      .optional()
      .describe('IDs of users whose role assignments were removed during this execution.'),
    /** Additional JSON metadata about the execution, if any. */
    metadata: z
      .string()
      .nullish()
      .describe('Additional JSON metadata about the execution, if any.'),
  })
  .describe('A recorded role binding reconciliation run.');

/**
 * Represents a recorded execution of a role binding reconciliation run.
 *
 * Roles API 1.0 model inferred from {@link ApiBindingExecutionRecordSchemaV1}, so
 * `ApiBindingExecutionRecordV1` and the runtime validator can never describe different shapes.
 */
export type ApiBindingExecutionRecordV1 = z.infer<typeof ApiBindingExecutionRecordSchemaV1>;
