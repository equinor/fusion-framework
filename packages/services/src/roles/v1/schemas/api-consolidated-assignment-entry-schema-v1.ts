import { z } from 'zod';

/** Zod schema for an assignment entry contributing to a consolidated assignment. */
export const ApiConsolidatedAssignmentEntrySchemaV1 = z
  .object({
    /** Unique identifier of this assignment entry. */
    id: z.string().optional().describe('Unique identifier of this assignment entry.'),
    /** Date from which this entry is valid, if any. */
    validFrom: z.string().nullish().describe('Date from which this entry is valid, if any.'),
    /** Date until which this entry is valid, if any. */
    validTo: z.string().nullish().describe('Date until which this entry is valid, if any.'),
    /** Reason for this assignment entry. */
    reason: z.string().optional().describe('Reason for this assignment entry.'),
    /** The origin system that created this entry, if any. Omitted when null. */
    source: z
      .string()
      .nullish()
      .describe('The origin system that created this entry, if any. Omitted when null.'),
    /** Identifier in the originating system, if any. Omitted when null. */
    externalIdentifier: z
      .string()
      .nullish()
      .describe('Identifier in the originating system, if any. Omitted when null.'),
  })
  .describe('An assignment entry contributing to a consolidated assignment.');

/**
 * Represents a single contributing assignment entry in a consolidated role assignment view.
 *
 * Roles API 1.0 model inferred from {@link ApiConsolidatedAssignmentEntrySchemaV1}, so
 * `ApiConsolidatedAssignmentEntryV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiConsolidatedAssignmentEntryV1 = z.infer<
  typeof ApiConsolidatedAssignmentEntrySchemaV1
>;
