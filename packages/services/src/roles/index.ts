/**
 * @packageDocumentation
 *
 * Fusion Roles V2 endpoint functions and types.
 *
 * The Fusion Roles service manages roles, claimable roles, access roles, the systems that own
 * them, and the role assignments that grant them to user and application accounts. Every
 * operation the Roles V2 OpenAPI document publishes is exported here as a standalone,
 * tree-shakeable function that takes an `IHttpClient` and issues exactly one HTTP request
 * against that service: accounts, roles, claimable roles, systems, access roles, scope types,
 * role binding configurations, event subscriptions, and the public schema catalogue.
 *
 * Each endpoint is curried — bind the API version, HTTP client, and execution
 * method once, then call the returned function with the operation arguments.
 * Every endpoint function carries the OpenAPI summary of the operation it
 * implements, so its hover documentation names the resource and the HTTP verb.
 *
 * ## Finding the right function
 *
 * | Task | Functions |
 * | --- | --- |
 * | Fetch, list, create, update, delete roles | `getRole`, `listRoles`, `createRole`, `updateRole`, `deleteRole` |
 * | Assign and revoke roles | `assignRole`, `listRoleAssignments`, `getRoleAssignment`, `updateRoleAssignment`, `deleteRoleAssignment`, `deleteRoleAssignments` |
 * | Claim and deactivate claimable roles | `activateClaimableRoleAssignment`, `deactivateClaimableRoleAssignment`, `listAccountClaimableRoleAssignments`, `listActivationsForClaimableRoleAssignment` |
 * | Manage claimable roles | `getClaimableRole`, `listClaimableRoles`, `createClaimableRole`, `updateClaimableRole`, `deleteClaimableRole` |
 * | Systems and their access roles | `listSystems`, `createSystem`, `listSystemAccessRoles`, `assignSystemAccessRole` |
 * | Scope types | `listScopeTypes`, `createScopeType`, `updateScopeType`, `deleteScopeType` |
 * | Role binding configurations | `listRoleBindingConfigurations`, `createRoleBindingConfiguration`, `getRoleBindingConfigurationStatus`, `purgeExpiredRoleBindingConfigurationHistory` |
 *
 * ## Promises or observables
 *
 * The third argument selects how a request is consumed and defaults to `'json'`.
 * `'json'` resolves a `Promise`; `'json$'` returns an observable `StreamResponse`.
 * Both carry the same response type, so `GetRoleResult<'v1'>` is
 * `Promise<GetRoleResponse<'v1'>>` and `GetRoleResult<'v1', 'json$'>` is
 * `StreamResponse<GetRoleResponse<'v1'>>`.
 *
 * ## Version-coupled endpoint typing
 *
 * Endpoints follow the Octokit model: the API version is the single discriminator
 * for an operation. Each endpoint declares one version contract —
 * `{ [ApiVersion.v1]: { args, response } }` — keyed by the *concrete* version, and
 * the version a caller passes selects the request path, the `api-version` query
 * parameter, the argument schema, and the response schema from that one entry.
 * They can never disagree, and an unsupported version throws before the HTTP
 * client is touched.
 *
 * The coupling holds at compile time too: `GetRoleArg<'v1'>` and
 * `GetRoleResponse<'v1'>` resolve through the contract entry for the selected
 * version rather than collapsing to a version-neutral shape. `'v1'`, `'1.0'`, and
 * `ApiVersion.v1` all name the same version, so all three infer the same types; a
 * future `'v2'` would infer different ones without unioning fields across
 * versions.
 *
 * Every operation exports four types beside its function: `<Operation>Version`
 * (the identifiers it accepts), `<Operation>Arg` (its arguments),
 * `<Operation>Response` (its response body), and `<Operation>Result` (what the
 * selected client method hands back).
 *
 * Reusable schemas live in a version-scoped module graph (`v1/schemas`) and carry
 * a matching symbol suffix (`ApiRoleSchemaV1`), so no schema can be reused for a
 * version it was not written for.
 *
 * ## Models are inferred, never declared twice
 *
 * The Zod schemas are the single source of truth. Every model type — `ApiRoleV1`,
 * `CreateRoleRequestV1`, and the rest — is `z.infer` of its schema, so the runtime
 * validator and the compile-time type can never disagree. The direction of truth is
 * Zod → TypeScript and cannot be reversed: TypeScript types are erased at runtime
 * and cannot produce a validator. Model names carry the API version, so `ApiRoleV1`
 * can never silently become a future version's shape.
 *
 * ## The OpenAPI snapshot
 *
 * The complete published contract ships with the package and is importable for
 * mocks, fixtures, and code generation:
 * `import openapi from '@equinor/fusion-services/roles/v1/openapi.json' with { type: 'json' }`.
 * The subpath is versioned by the *API* version it describes. To check the snapshot
 * against the live service, run
 * `pnpm --filter @equinor/fusion-services check:openapi roles`; it is read-only and
 * reports drift per operation and per component schema.
 *
 * Endpoints are reachable only through this service subpath
 * (`@equinor/fusion-services/roles`) — the package root exports no aggregated API,
 * so a second service can never turn the root into a namespace that drags every
 * schema graph into a bundle.
 *
 * @example
 * ```ts
 * import { getRole } from '@equinor/fusion-services/roles';
 *
 * const role = await getRole('v1', httpClient)({ roleIdentifier: 'reader' });
 * ```
 *
 * @example
 * ```ts
 * import { listRoles } from '@equinor/fusion-services/roles';
 *
 * listRoles('v1', httpClient, 'json$')({ top: 10 }).subscribe(console.log);
 * ```
 *
 * @example
 * Claim a claimable role assignment for eight hours, then release it early.
 * ```ts
 * import {
 *   activateClaimableRoleAssignment,
 *   deactivateClaimableRoleAssignment,
 * } from '@equinor/fusion-services/roles';
 *
 * const claim = { accountIdentifier: 'user@equinor.com', claimableRoleAssignmentId: id };
 *
 * await activateClaimableRoleAssignment('v1', httpClient)({ ...claim, hours: 8 });
 * await deactivateClaimableRoleAssignment('v1', httpClient)(claim);
 * ```
 */

export { ApiVersion } from './static';

export type * from './types';

export type * from './v1/types';

export {
  type ActivateClaimableRoleAssignmentArg,
  type ActivateClaimableRoleAssignmentResponse,
  type ActivateClaimableRoleAssignmentResult,
  type ActivateClaimableRoleAssignmentVersion,
  activateClaimableRoleAssignment,
} from './endpoints/account-claimable-role-assignment-activation.post';

export {
  type AddClaimableRoleAccessRolesArg,
  type AddClaimableRoleAccessRolesResponse,
  type AddClaimableRoleAccessRolesResult,
  type AddClaimableRoleAccessRolesVersion,
  addClaimableRoleAccessRoles,
} from './endpoints/claimable-role-access-roles.post';

export {
  type AddRoleAccessRolesArg,
  type AddRoleAccessRolesResponse,
  type AddRoleAccessRolesResult,
  type AddRoleAccessRolesVersion,
  addRoleAccessRoles,
} from './endpoints/role-access-roles.post';

export {
  type AssignClaimableRoleArg,
  type AssignClaimableRoleResponse,
  type AssignClaimableRoleResult,
  type AssignClaimableRoleVersion,
  assignClaimableRole,
} from './endpoints/claimable-role-assignments.post';

export {
  type AssignRoleArg,
  type AssignRoleResponse,
  type AssignRoleResult,
  type AssignRoleVersion,
  assignRole,
} from './endpoints/role-assignments.post';

export {
  type AssignSystemAccessRoleArg,
  type AssignSystemAccessRoleResponse,
  type AssignSystemAccessRoleResult,
  type AssignSystemAccessRoleVersion,
  assignSystemAccessRole,
} from './endpoints/system-access-role-assignments.post';

export {
  type CreateClaimableRoleArg,
  type CreateClaimableRoleResponse,
  type CreateClaimableRoleResult,
  type CreateClaimableRoleVersion,
  createClaimableRole,
} from './endpoints/claimable-roles.post';

export {
  type CreateRoleArg,
  type CreateRoleResponse,
  type CreateRoleResult,
  type CreateRoleVersion,
  createRole,
} from './endpoints/roles.post';

export {
  type CreateRoleBindingConfigurationArg,
  type CreateRoleBindingConfigurationResponse,
  type CreateRoleBindingConfigurationResult,
  type CreateRoleBindingConfigurationVersion,
  createRoleBindingConfiguration,
} from './endpoints/role-binding-configurations.post';

export {
  type CreateRoleBindingConfigurationHistoryRecordArg,
  type CreateRoleBindingConfigurationHistoryRecordResponse,
  type CreateRoleBindingConfigurationHistoryRecordResult,
  type CreateRoleBindingConfigurationHistoryRecordVersion,
  createRoleBindingConfigurationHistoryRecord,
} from './endpoints/role-binding-configuration-history.post';

export {
  type CreateRoleBindingConfigurationNotificationRecordArg,
  type CreateRoleBindingConfigurationNotificationRecordResponse,
  type CreateRoleBindingConfigurationNotificationRecordResult,
  type CreateRoleBindingConfigurationNotificationRecordVersion,
  createRoleBindingConfigurationNotificationRecord,
} from './endpoints/role-binding-configuration-notifications.post';

export {
  type CreateScopeTypeArg,
  type CreateScopeTypeResponse,
  type CreateScopeTypeResult,
  type CreateScopeTypeVersion,
  createScopeType,
} from './endpoints/scope-types.post';

export {
  type CreateSystemArg,
  type CreateSystemResponse,
  type CreateSystemResult,
  type CreateSystemVersion,
  createSystem,
} from './endpoints/systems.post';

export {
  type CreateSystemAccessRoleArg,
  type CreateSystemAccessRoleResponse,
  type CreateSystemAccessRoleResult,
  type CreateSystemAccessRoleVersion,
  createSystemAccessRole,
} from './endpoints/system-access-roles.post';

export {
  type DeactivateClaimableRoleAssignmentArg,
  type DeactivateClaimableRoleAssignmentResponse,
  type DeactivateClaimableRoleAssignmentResult,
  type DeactivateClaimableRoleAssignmentVersion,
  deactivateClaimableRoleAssignment,
} from './endpoints/account-claimable-role-assignment-deactivation.post';

export {
  type DeleteClaimableRoleArg,
  type DeleteClaimableRoleResponse,
  type DeleteClaimableRoleResult,
  type DeleteClaimableRoleVersion,
  deleteClaimableRole,
} from './endpoints/claimable-role.delete';

export {
  type DeleteClaimableRoleAccessRoleArg,
  type DeleteClaimableRoleAccessRoleResponse,
  type DeleteClaimableRoleAccessRoleResult,
  type DeleteClaimableRoleAccessRoleVersion,
  deleteClaimableRoleAccessRole,
} from './endpoints/claimable-role-access-role.delete';

export {
  type DeleteClaimableRoleAssignmentArg,
  type DeleteClaimableRoleAssignmentResponse,
  type DeleteClaimableRoleAssignmentResult,
  type DeleteClaimableRoleAssignmentVersion,
  deleteClaimableRoleAssignment,
} from './endpoints/claimable-role-assignment.delete';

export {
  type DeleteClaimableRoleAssignmentsByExternalIdentifierArg,
  type DeleteClaimableRoleAssignmentsByExternalIdentifierResponse,
  type DeleteClaimableRoleAssignmentsByExternalIdentifierResult,
  type DeleteClaimableRoleAssignmentsByExternalIdentifierVersion,
  deleteClaimableRoleAssignmentsByExternalIdentifier,
} from './endpoints/claimable-role-assignments-by-external-identifier.delete';

export {
  type DeleteRoleArg,
  type DeleteRoleResponse,
  type DeleteRoleResult,
  type DeleteRoleVersion,
  deleteRole,
} from './endpoints/role.delete';

export {
  type DeleteRoleAccessRoleArg,
  type DeleteRoleAccessRoleResponse,
  type DeleteRoleAccessRoleResult,
  type DeleteRoleAccessRoleVersion,
  deleteRoleAccessRole,
} from './endpoints/role-access-role.delete';

export {
  type DeleteRoleAssignmentArg,
  type DeleteRoleAssignmentResponse,
  type DeleteRoleAssignmentResult,
  type DeleteRoleAssignmentVersion,
  deleteRoleAssignment,
} from './endpoints/role-assignment.delete';

export {
  type DeleteRoleAssignmentsArg,
  type DeleteRoleAssignmentsResponse,
  type DeleteRoleAssignmentsResult,
  type DeleteRoleAssignmentsVersion,
  deleteRoleAssignments,
} from './endpoints/role-assignments-delete.post';

export {
  type DeleteRoleAssignmentsByExternalIdentifierArg,
  type DeleteRoleAssignmentsByExternalIdentifierResponse,
  type DeleteRoleAssignmentsByExternalIdentifierResult,
  type DeleteRoleAssignmentsByExternalIdentifierVersion,
  deleteRoleAssignmentsByExternalIdentifier,
} from './endpoints/role-assignments-by-external-identifier.delete';

export {
  type DeleteRoleBindingConfigurationArg,
  type DeleteRoleBindingConfigurationResponse,
  type DeleteRoleBindingConfigurationResult,
  type DeleteRoleBindingConfigurationVersion,
  deleteRoleBindingConfiguration,
} from './endpoints/role-binding-configuration.delete';

export {
  type DeleteScopeTypeArg,
  type DeleteScopeTypeResponse,
  type DeleteScopeTypeResult,
  type DeleteScopeTypeVersion,
  deleteScopeType,
} from './endpoints/scope-type.delete';

export {
  type DeleteSystemArg,
  type DeleteSystemResponse,
  type DeleteSystemResult,
  type DeleteSystemVersion,
  deleteSystem,
} from './endpoints/system.delete';

export {
  type DeleteSystemAccessRoleArg,
  type DeleteSystemAccessRoleResponse,
  type DeleteSystemAccessRoleResult,
  type DeleteSystemAccessRoleVersion,
  deleteSystemAccessRole,
} from './endpoints/system-access-role.delete';

export {
  type DeleteSystemAccessRoleAssignmentArg,
  type DeleteSystemAccessRoleAssignmentResponse,
  type DeleteSystemAccessRoleAssignmentResult,
  type DeleteSystemAccessRoleAssignmentVersion,
  deleteSystemAccessRoleAssignment,
} from './endpoints/system-access-role-assignment.delete';

export {
  type GetClaimableRoleArg,
  type GetClaimableRoleResponse,
  type GetClaimableRoleResult,
  type GetClaimableRoleVersion,
  getClaimableRole,
} from './endpoints/claimable-role.get';

export {
  type GetClaimableRoleAssignmentArg,
  type GetClaimableRoleAssignmentResponse,
  type GetClaimableRoleAssignmentResult,
  type GetClaimableRoleAssignmentVersion,
  getClaimableRoleAssignment,
} from './endpoints/claimable-role-assignment.get';

export {
  type GetClaimableRoleAssignmentActivationArg,
  type GetClaimableRoleAssignmentActivationResponse,
  type GetClaimableRoleAssignmentActivationResult,
  type GetClaimableRoleAssignmentActivationVersion,
  getClaimableRoleAssignmentActivation,
} from './endpoints/account-claimable-role-assignment-activation.get';

export {
  type GetPublicSchemaArg,
  type GetPublicSchemaResponse,
  type GetPublicSchemaResult,
  type GetPublicSchemaVersion,
  getPublicSchema,
} from './endpoints/public-schema.get';

export {
  type GetRoleArg,
  type GetRoleResponse,
  type GetRoleResult,
  type GetRoleVersion,
  getRole,
} from './endpoints/role.get';

export {
  type GetRoleAssignmentArg,
  type GetRoleAssignmentResponse,
  type GetRoleAssignmentResult,
  type GetRoleAssignmentVersion,
  getRoleAssignment,
} from './endpoints/role-assignment.get';

export {
  type GetRoleBindingConfigurationArg,
  type GetRoleBindingConfigurationResponse,
  type GetRoleBindingConfigurationResult,
  type GetRoleBindingConfigurationVersion,
  getRoleBindingConfiguration,
} from './endpoints/role-binding-configuration.get';

export {
  type GetRoleBindingConfigurationStatusArg,
  type GetRoleBindingConfigurationStatusResponse,
  type GetRoleBindingConfigurationStatusResult,
  type GetRoleBindingConfigurationStatusVersion,
  getRoleBindingConfigurationStatus,
} from './endpoints/role-binding-configuration-status.get';

export {
  type GetScopeTypeArg,
  type GetScopeTypeResponse,
  type GetScopeTypeResult,
  type GetScopeTypeVersion,
  getScopeType,
} from './endpoints/scope-type.get';

export {
  type GetSystemArg,
  type GetSystemResponse,
  type GetSystemResult,
  type GetSystemVersion,
  getSystem,
} from './endpoints/system.get';

export {
  type GetSystemAccessRoleArg,
  type GetSystemAccessRoleResponse,
  type GetSystemAccessRoleResult,
  type GetSystemAccessRoleVersion,
  getSystemAccessRole,
} from './endpoints/system-access-role.get';

export {
  type GetSystemAccessRoleAssignmentArg,
  type GetSystemAccessRoleAssignmentResponse,
  type GetSystemAccessRoleAssignmentResult,
  type GetSystemAccessRoleAssignmentVersion,
  getSystemAccessRoleAssignment,
} from './endpoints/system-access-role-assignment.get';

export {
  type ListAccessRolesArg,
  type ListAccessRolesResponse,
  type ListAccessRolesResult,
  type ListAccessRolesVersion,
  listAccessRoles,
} from './endpoints/access-roles.get';

export {
  type ListAccountAccessRoleAssignmentsArg,
  type ListAccountAccessRoleAssignmentsResponse,
  type ListAccountAccessRoleAssignmentsResult,
  type ListAccountAccessRoleAssignmentsVersion,
  listAccountAccessRoleAssignments,
} from './endpoints/account-access-role-assignments.get';

export {
  type ListAccountActiveAccessRoleAssignmentsArg,
  type ListAccountActiveAccessRoleAssignmentsResponse,
  type ListAccountActiveAccessRoleAssignmentsResult,
  type ListAccountActiveAccessRoleAssignmentsVersion,
  listAccountActiveAccessRoleAssignments,
} from './endpoints/account-active-access-role-assignments.get';

export {
  type ListAccountClaimableRoleAssignmentsArg,
  type ListAccountClaimableRoleAssignmentsResponse,
  type ListAccountClaimableRoleAssignmentsResult,
  type ListAccountClaimableRoleAssignmentsVersion,
  listAccountClaimableRoleAssignments,
} from './endpoints/account-claimable-role-assignments.get';

export {
  type ListAccountConsolidatedClaimableRoleAssignmentsArg,
  type ListAccountConsolidatedClaimableRoleAssignmentsResponse,
  type ListAccountConsolidatedClaimableRoleAssignmentsResult,
  type ListAccountConsolidatedClaimableRoleAssignmentsVersion,
  listAccountConsolidatedClaimableRoleAssignments,
} from './endpoints/account-consolidated-claimable-role-assignments.get';

export {
  type ListAccountConsolidatedRoleAssignmentsArg,
  type ListAccountConsolidatedRoleAssignmentsResponse,
  type ListAccountConsolidatedRoleAssignmentsResult,
  type ListAccountConsolidatedRoleAssignmentsVersion,
  listAccountConsolidatedRoleAssignments,
} from './endpoints/account-consolidated-role-assignments.get';

export {
  type ListAccountRoleAssignmentsArg,
  type ListAccountRoleAssignmentsResponse,
  type ListAccountRoleAssignmentsResult,
  type ListAccountRoleAssignmentsVersion,
  listAccountRoleAssignments,
} from './endpoints/account-role-assignments.get';

export {
  type ListActivationsForClaimableRoleAssignmentArg,
  type ListActivationsForClaimableRoleAssignmentResponse,
  type ListActivationsForClaimableRoleAssignmentResult,
  type ListActivationsForClaimableRoleAssignmentVersion,
  listActivationsForClaimableRoleAssignment,
} from './endpoints/claimable-role-assignment-activations-by-assignment.get';

export {
  type ListClaimableRoleAssignmentActivationsArg,
  type ListClaimableRoleAssignmentActivationsResponse,
  type ListClaimableRoleAssignmentActivationsResult,
  type ListClaimableRoleAssignmentActivationsVersion,
  listClaimableRoleAssignmentActivations,
} from './endpoints/claimable-role-assignment-activations.get';

export {
  type ListClaimableRoleAssignmentsArg,
  type ListClaimableRoleAssignmentsResponse,
  type ListClaimableRoleAssignmentsResult,
  type ListClaimableRoleAssignmentsVersion,
  listClaimableRoleAssignments,
} from './endpoints/claimable-role-assignments.get';

export {
  type ListClaimableRolesArg,
  type ListClaimableRolesResponse,
  type ListClaimableRolesResult,
  type ListClaimableRolesVersion,
  listClaimableRoles,
} from './endpoints/claimable-roles.get';

export {
  type ListRoleAssignmentsArg,
  type ListRoleAssignmentsResponse,
  type ListRoleAssignmentsResult,
  type ListRoleAssignmentsVersion,
  listRoleAssignments,
} from './endpoints/role-assignments.get';

export {
  type ListRoleBindingConfigurationHistoryArg,
  type ListRoleBindingConfigurationHistoryResponse,
  type ListRoleBindingConfigurationHistoryResult,
  type ListRoleBindingConfigurationHistoryVersion,
  listRoleBindingConfigurationHistory,
} from './endpoints/role-binding-configuration-history.get';

export {
  type ListRoleBindingConfigurationNotificationsArg,
  type ListRoleBindingConfigurationNotificationsResponse,
  type ListRoleBindingConfigurationNotificationsResult,
  type ListRoleBindingConfigurationNotificationsVersion,
  listRoleBindingConfigurationNotifications,
} from './endpoints/role-binding-configuration-notifications.get';

export {
  type ListRoleBindingConfigurationsArg,
  type ListRoleBindingConfigurationsResponse,
  type ListRoleBindingConfigurationsResult,
  type ListRoleBindingConfigurationsVersion,
  listRoleBindingConfigurations,
} from './endpoints/role-binding-configurations.get';

export {
  type ListRolesArg,
  type ListRolesResponse,
  type ListRolesResult,
  type ListRolesVersion,
  listRoles,
} from './endpoints/roles.get';

export {
  type ListScopeTypesArg,
  type ListScopeTypesResponse,
  type ListScopeTypesResult,
  type ListScopeTypesVersion,
  listScopeTypes,
} from './endpoints/scope-types.get';

export {
  type ListSystemAccessRoleAssignmentsArg,
  type ListSystemAccessRoleAssignmentsResponse,
  type ListSystemAccessRoleAssignmentsResult,
  type ListSystemAccessRoleAssignmentsVersion,
  listSystemAccessRoleAssignments,
} from './endpoints/system-access-role-assignments.get';

export {
  type ListSystemAccessRolesArg,
  type ListSystemAccessRolesResponse,
  type ListSystemAccessRolesResult,
  type ListSystemAccessRolesVersion,
  listSystemAccessRoles,
} from './endpoints/system-access-roles.get';

export {
  type ListSystemsArg,
  type ListSystemsResponse,
  type ListSystemsResult,
  type ListSystemsVersion,
  listSystems,
} from './endpoints/systems.get';

export {
  type PurgeExpiredRoleBindingConfigurationHistoryArg,
  type PurgeExpiredRoleBindingConfigurationHistoryResponse,
  type PurgeExpiredRoleBindingConfigurationHistoryResult,
  type PurgeExpiredRoleBindingConfigurationHistoryVersion,
  purgeExpiredRoleBindingConfigurationHistory,
} from './endpoints/role-binding-configuration-expired-history.delete';

export {
  type PutRolesSubscriptionArg,
  type PutRolesSubscriptionResponse,
  type PutRolesSubscriptionResult,
  type PutRolesSubscriptionVersion,
  putRolesSubscription,
} from './endpoints/roles-subscription.put';

export {
  type UpdateClaimableRoleArg,
  type UpdateClaimableRoleResponse,
  type UpdateClaimableRoleResult,
  type UpdateClaimableRoleVersion,
  updateClaimableRole,
} from './endpoints/claimable-role.patch';

export {
  type UpdateClaimableRoleAssignmentArg,
  type UpdateClaimableRoleAssignmentResponse,
  type UpdateClaimableRoleAssignmentResult,
  type UpdateClaimableRoleAssignmentVersion,
  updateClaimableRoleAssignment,
} from './endpoints/claimable-role-assignment.patch';

export {
  type UpdateRoleArg,
  type UpdateRoleResponse,
  type UpdateRoleResult,
  type UpdateRoleVersion,
  updateRole,
} from './endpoints/role.patch';

export {
  type UpdateRoleAssignmentArg,
  type UpdateRoleAssignmentResponse,
  type UpdateRoleAssignmentResult,
  type UpdateRoleAssignmentVersion,
  updateRoleAssignment,
} from './endpoints/role-assignment.patch';

export {
  type UpdateRoleBindingConfigurationArg,
  type UpdateRoleBindingConfigurationResponse,
  type UpdateRoleBindingConfigurationResult,
  type UpdateRoleBindingConfigurationVersion,
  updateRoleBindingConfiguration,
} from './endpoints/role-binding-configuration.patch';

export {
  type UpdateRoleBindingConfigurationStatusArg,
  type UpdateRoleBindingConfigurationStatusResponse,
  type UpdateRoleBindingConfigurationStatusResult,
  type UpdateRoleBindingConfigurationStatusVersion,
  updateRoleBindingConfigurationStatus,
} from './endpoints/role-binding-configuration-status.patch';

export {
  type UpdateScopeTypeArg,
  type UpdateScopeTypeResponse,
  type UpdateScopeTypeResult,
  type UpdateScopeTypeVersion,
  updateScopeType,
} from './endpoints/scope-type.patch';

export {
  type UpdateSystemArg,
  type UpdateSystemResponse,
  type UpdateSystemResult,
  type UpdateSystemVersion,
  updateSystem,
} from './endpoints/system.patch';

export {
  type UpdateSystemAccessRoleArg,
  type UpdateSystemAccessRoleResponse,
  type UpdateSystemAccessRoleResult,
  type UpdateSystemAccessRoleVersion,
  updateSystemAccessRole,
} from './endpoints/system-access-role.patch';

export {
  type UpdateSystemAccessRoleAssignmentArg,
  type UpdateSystemAccessRoleAssignmentResponse,
  type UpdateSystemAccessRoleAssignmentResult,
  type UpdateSystemAccessRoleAssignmentVersion,
  updateSystemAccessRoleAssignment,
} from './endpoints/system-access-role-assignment.patch';
