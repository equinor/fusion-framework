import { z } from 'zod';
import { EntraGroupBindingSchemaV1 } from './entra-group-binding-schema-v1';
import { OrgChartBindingSchemaV1 } from './org-chart-binding-schema-v1';

/**
 * Zod schema for the binding payload of a role binding configuration.
 *
 * The upstream schema is a `oneOf` without a discriminator property, so the
 * union is resolved by trying the Entra group shape before the org-chart shape.
 */
export const RoleBindingConfigurationBindingSchemaV1 = z
  .union([EntraGroupBindingSchemaV1, OrgChartBindingSchemaV1])
  .describe('The binding payload of a role binding configuration.');

/**
 * The binding payload of a role binding configuration: either an Entra ID group binding or an
 * org-chart binding, since the contract publishes a `oneOf` without a discriminator.
 *
 * Roles API 1.0 model inferred from {@link RoleBindingConfigurationBindingSchemaV1}, so
 * `RoleBindingConfigurationBindingV1` and the runtime validator can never describe different
 * shapes.
 */
export type RoleBindingConfigurationBindingV1 = z.infer<
  typeof RoleBindingConfigurationBindingSchemaV1
>;
