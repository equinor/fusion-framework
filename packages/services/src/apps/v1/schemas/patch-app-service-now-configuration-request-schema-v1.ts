import { z } from 'zod';

/**
 * Zod schema for the `PatchAppServiceNowConfigurationRequest` model published by the Fusion Apps
 * API 1.0.
 *
 * ServiceNow identifiers to set for a Fusion application. All four values are required when this
 * object is provided; set the whole property to null to clear a stored configuration.
 */
export const PatchAppServiceNowConfigurationRequestSchemaV1 = z
  .object({
    /** The ServiceNow application identifier associated with this Fusion application. */
    appId: z
      .string()
      .optional()
      .describe('The ServiceNow application identifier associated with this Fusion application.'),
    /** The ServiceNow assignment group associated with this application. */
    assignmentGroup: z
      .string()
      .optional()
      .describe('The ServiceNow assignment group associated with this application.'),
    /** The ServiceNow configuration item (cmdb_ci) associated with this application. */
    configurationItem: z
      .string()
      .optional()
      .describe('The ServiceNow configuration item (cmdb_ci) associated with this application.'),
    /** The ServiceNow service offering associated with this application. */
    serviceOffering: z
      .string()
      .optional()
      .describe('The ServiceNow service offering associated with this application.'),
  })
  .describe(
    'ServiceNow identifiers to set for a Fusion application. All four values are required when this object is provided; set the whole property to null to clear a stored configuration.',
  );

/**
 * ServiceNow identifiers to set for a Fusion application. All four values are required when this
 * object is provided; set the whole property to null to clear a stored configuration.
 *
 * Apps API 1.0 model inferred from {@link PatchAppServiceNowConfigurationRequestSchemaV1}, so
 * `PatchAppServiceNowConfigurationRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type PatchAppServiceNowConfigurationRequestV1 = z.infer<
  typeof PatchAppServiceNowConfigurationRequestSchemaV1
>;
