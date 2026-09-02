import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';

/**
 * Zod schema for the `ApiAppTagHistory` model published by the Fusion Apps API 1.0.
 *
 * A historical record of a tag assignment, capturing when a tag was pointing to a specific build
 * and when (if ever) that assignment was superseded.
 */
export const ApiAppTagHistorySchemaV1 = z
  .object({
    /** The internal identifier of the build (app version) this tag pointed to. */
    buildId: z
      .string()
      .optional()
      .describe('The internal identifier of the build (app version) this tag pointed to.'),
    /** The UTC date and time when this tag assignment was created. */
    created: z
      .string()
      .optional()
      .describe('The UTC date and time when this tag assignment was created.'),
    /** Account that pointed the tag at this build. */
    createdBy: ApiAccountSchemaV1.optional().describe(
      'Account that pointed the tag at this build.',
    ),
    /** Account that removed the tag from this build, if any. */
    deletedBy: ApiAccountSchemaV1.nullish().describe(
      'Account that removed the tag from this build, if any.',
    ),
    /** when this record represents the current (active) tag assignment. */
    isCurrent: z
      .boolean()
      .optional()
      .describe('when this record represents the current (active) tag assignment.'),
    /** The UTC date and time when this tag assignment was superseded by a newer assignment. if this is the current assignment. */
    replaced: z
      .string()
      .nullish()
      .describe(
        'The UTC date and time when this tag assignment was superseded by a newer assignment. if this is the current assignment.',
      ),
    /** The tag name, e.g. latest. */
    tagName: z.string().optional().describe('The tag name, e.g. latest.'),
    /** The semantic version string of the build this tag pointed to, e.g. 1.2.3. */
    version: z
      .string()
      .optional()
      .describe('The semantic version string of the build this tag pointed to, e.g. 1.2.3.'),
  })
  .describe(
    'A historical record of a tag assignment, capturing when a tag was pointing to a specific build and when (if ever) that assignment was superseded.',
  );

/**
 * A historical record of a tag assignment, capturing when a tag was pointing to a specific build
 * and when (if ever) that assignment was superseded.
 *
 * Apps API 1.0 model inferred from {@link ApiAppTagHistorySchemaV1}, so `ApiAppTagHistoryV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiAppTagHistoryV1 = z.infer<typeof ApiAppTagHistorySchemaV1>;
