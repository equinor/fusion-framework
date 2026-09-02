import type { z } from 'zod';
import { PatchAppServiceNowConfigurationRequestSchemaV1 } from './patch-app-service-now-configuration-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfPatchAppServiceNowConfigurationRequest` model published by the
 * Fusion Apps API 1.0.
 *
 * ServiceNow identifiers for the app. All four values are required when provided. Set to null to
 * clear.
 */
export const PatchPropertyOfPatchAppServiceNowConfigurationRequestSchemaV1 =
  PatchAppServiceNowConfigurationRequestSchemaV1.nullable().describe(
    'ServiceNow identifiers for the app. All four values are required when provided. Set to null to clear.',
  );

/**
 * ServiceNow identifiers for the app. All four values are required when provided. Set to null to
 * clear.
 *
 * Apps API 1.0 model inferred from
 * {@link PatchPropertyOfPatchAppServiceNowConfigurationRequestSchemaV1}, so
 * `PatchPropertyOfPatchAppServiceNowConfigurationRequestV1` and the runtime validator can never
 * describe different shapes.
 */
export type PatchPropertyOfPatchAppServiceNowConfigurationRequestV1 = z.infer<
  typeof PatchPropertyOfPatchAppServiceNowConfigurationRequestSchemaV1
>;
