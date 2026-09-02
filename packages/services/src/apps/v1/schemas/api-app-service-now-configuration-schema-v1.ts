import { z } from 'zod';

/**
 * Zod schema for the `ApiAppServiceNowConfiguration` model published by the Fusion Apps API 1.0.
 *
 * ServiceNow identifiers manually maintained for this application. if not yet configured.
 */
export const ApiAppServiceNowConfigurationSchemaV1 = z
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
    'ServiceNow identifiers manually maintained for this application. if not yet configured.',
  );

/**
 * ServiceNow identifiers manually maintained for this application. if not yet configured.
 *
 * Apps API 1.0 model inferred from {@link ApiAppServiceNowConfigurationSchemaV1}, so
 * `ApiAppServiceNowConfigurationV1` and the runtime validator can never describe different shapes.
 */
export type ApiAppServiceNowConfigurationV1 = z.infer<typeof ApiAppServiceNowConfigurationSchemaV1>;
