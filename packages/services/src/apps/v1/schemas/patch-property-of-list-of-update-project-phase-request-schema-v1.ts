import { z } from 'zod';
import { UpdateProjectPhaseRequestSchemaV1 } from './update-project-phase-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfListOfUpdateProjectPhaseRequest` model published by the Fusion
 * Apps API 1.0.
 *
 * Updated list of project phases the app supports.
 */
export const PatchPropertyOfListOfUpdateProjectPhaseRequestSchemaV1 = z
  .array(UpdateProjectPhaseRequestSchemaV1)
  .nullable()
  .describe('Updated list of project phases the app supports.');

/**
 * Updated list of project phases the app supports.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfListOfUpdateProjectPhaseRequestSchemaV1},
 * so `PatchPropertyOfListOfUpdateProjectPhaseRequestV1` and the runtime validator can never
 * describe different shapes.
 */
export type PatchPropertyOfListOfUpdateProjectPhaseRequestV1 = z.infer<
  typeof PatchPropertyOfListOfUpdateProjectPhaseRequestSchemaV1
>;
