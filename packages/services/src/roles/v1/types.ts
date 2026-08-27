/**
 * Model types for Fusion Roles API version 1.0.
 *
 * Every type here is `z.infer` of the matching schema in `./schemas`. The direction
 * of truth is Zod → TypeScript: the schemas validate at runtime and the types are
 * derived from them, because TypeScript types are erased and cannot produce a
 * validator. Nothing in this package declares an API shape twice.
 *
 * The names carry the API version they describe, so `ApiRoleV1` can never silently
 * become the shape of a future API version. A Roles API 2.0 would add `ApiRoleV2`
 * from a sibling `../v2` graph.
 *
 * This module is type-only, so re-exporting it costs nothing at runtime and pulls
 * no schema module into a consumer's bundle.
 *
 * @packageDocumentation
 */

export type { AccessRoleMappingV1 } from './schemas/access-role-mapping-schema-v1';
export type { ActivateAssignedClaimableRoleRequestV1 } from './schemas/activate-assigned-claimable-role-request-schema-v1';
export type { AddClaimableRoleAccessRoleRequestV1 } from './schemas/add-claimable-role-access-role-request-schema-v1';
export type { AddRoleAccessRoleRequestV1 } from './schemas/add-role-access-role-request-schema-v1';
export type { ApiAccessRoleAssignmentV1 } from './schemas/api-access-role-assignment-schema-v1';
export type { ApiAccessRoleMappingV1 } from './schemas/api-access-role-mapping-schema-v1';
export type { ApiAccessRoleV1 } from './schemas/api-access-role-schema-v1';
export type { ApiAccountAccessRoleAssignmentV1 } from './schemas/api-account-access-role-assignment-schema-v1';
export type { ApiAccountAccessRoleV1 } from './schemas/api-account-access-role-schema-v1';
export type { ApiAccountActiveAccessRoleAssignmentV1 } from './schemas/api-account-active-access-role-assignment-schema-v1';
export type { ApiAccountClaimableRoleAssignmentV1 } from './schemas/api-account-claimable-role-assignment-schema-v1';
export type { ApiAccountRoleAssignmentV1 } from './schemas/api-account-role-assignment-schema-v1';
export type { ApiAccountV1 } from './schemas/api-account-schema-v1';
export type { ApiBindingExecutionRecordV1 } from './schemas/api-binding-execution-record-schema-v1';
export type { ApiBindingNotificationRecordV1 } from './schemas/api-binding-notification-record-schema-v1';
export type { ApiClaimableAccessRoleMappingV1 } from './schemas/api-claimable-access-role-mapping-schema-v1';
export type { ApiClaimableRoleAssignmentActivationV1 } from './schemas/api-claimable-role-assignment-activation-schema-v1';
export type { ApiClaimableRoleAssignmentV1 } from './schemas/api-claimable-role-assignment-schema-v1';
export type { ApiClaimableRoleScopeV1 } from './schemas/api-claimable-role-scope-schema-v1';
export type { ApiClaimableRoleV1 } from './schemas/api-claimable-role-schema-v1';
export type { ApiConsolidatedAssignmentEntryV1 } from './schemas/api-consolidated-assignment-entry-schema-v1';
export type { ApiConsolidatedClaimableRoleAssignmentV1 } from './schemas/api-consolidated-claimable-role-assignment-schema-v1';
export type { ApiConsolidatedClaimableRoleRefV1 } from './schemas/api-consolidated-claimable-role-ref-schema-v1';
export type { ApiConsolidatedRoleAssignmentV1 } from './schemas/api-consolidated-role-assignment-schema-v1';
export type { ApiExtendedAccessRoleV1 } from './schemas/api-extended-access-role-schema-v1';
export type { ApiExtendedClaimableRoleAssignmentActivationV1 } from './schemas/api-extended-claimable-role-assignment-activation-schema-v1';
export type { ApiOwnerV1 } from './schemas/api-owner-schema-v1';
export type { ApiPagedCollectionV1 } from './schemas/api-paged-collection-schema-v1';
export type { ApiPurgeBindingResultV1 } from './schemas/api-purge-binding-result-schema-v1';
export type { ApiRoleAssignmentV1 } from './schemas/api-role-assignment-schema-v1';
export type { ApiRoleBindingConfigurationStatusV1 } from './schemas/api-role-binding-configuration-status-schema-v1';
export type { ApiRoleBindingConfigurationV1 } from './schemas/api-role-binding-configuration-schema-v1';
export type { ApiRoleScopeV1 } from './schemas/api-role-scope-schema-v1';
export type { ApiRoleV1 } from './schemas/api-role-schema-v1';
export type { ApiScopeTypeV1 } from './schemas/api-scope-type-schema-v1';
export type { ApiScopeV1 } from './schemas/api-scope-schema-v1';
export type { ApiScopeValuesV1 } from './schemas/api-scope-values-schema-v1';
export type { ApiSimpleClaimableRoleAssignmentV1 } from './schemas/api-simple-claimable-role-assignment-schema-v1';
export type { ApiSimpleClaimableRoleV1 } from './schemas/api-simple-claimable-role-schema-v1';
export type { ApiSimpleRoleAssignmentV1 } from './schemas/api-simple-role-assignment-schema-v1';
export type { ApiSimpleRoleV1 } from './schemas/api-simple-role-schema-v1';
export type { ApiSimpleSystemV1 } from './schemas/api-simple-system-schema-v1';
export type { ApiSubscriptionTypeV1 } from './schemas/api-subscription-type-schema-v1';
export type { ApiSystemV1 } from './schemas/api-system-schema-v1';
export type { AssignAccessRoleRequestV1 } from './schemas/assign-access-role-request-schema-v1';
export type { AssignClaimableRoleRequestV1 } from './schemas/assign-claimable-role-request-schema-v1';
export type { AssignRoleRequestV1 } from './schemas/assign-role-request-schema-v1';
export type { ClaimableRoleBindingV1 } from './schemas/claimable-role-binding-schema-v1';
export type { CreateAccessRoleRequestV1 } from './schemas/create-access-role-request-schema-v1';
export type { CreateBindingExecutionRecordRequestV1 } from './schemas/create-binding-execution-record-request-schema-v1';
export type { CreateBindingExecutionRecordResponseV1 } from './schemas/create-binding-execution-record-response-schema-v1';
export type { CreateBindingNotificationRecordRequestV1 } from './schemas/create-binding-notification-record-request-schema-v1';
export type { CreateBindingNotificationRecordResponseV1 } from './schemas/create-binding-notification-record-response-schema-v1';
export type { CreateClaimableRoleRequestV1 } from './schemas/create-claimable-role-request-schema-v1';
export type { CreateRoleBindingConfigurationRequestV1 } from './schemas/create-role-binding-configuration-request-schema-v1';
export type { CreateRoleRequestV1 } from './schemas/create-role-request-schema-v1';
export type { CreateScopeTypeRequestV1 } from './schemas/create-scope-type-request-schema-v1';
export type { DeleteRoleAssignmentsRequestV1 } from './schemas/delete-role-assignments-request-schema-v1';
export type { EntraGroupBindingV1 } from './schemas/entra-group-binding-schema-v1';
export type { EntraGroupV1 } from './schemas/entra-group-schema-v1';
export type { ExpandV1 } from './schemas/expand-schema-v1';
export type { FilterV1 } from './schemas/filter-schema-v1';
export type { IncludeDeletedV1 } from './schemas/include-deleted-schema-v1';
export type { OrgChartAssignEntryV1 } from './schemas/org-chart-assign-entry-schema-v1';
export type { OrgChartAssignmentV1 } from './schemas/org-chart-assignment-schema-v1';
export type { OrgChartBindingV1 } from './schemas/org-chart-binding-schema-v1';
export type { OrgChartContextV1 } from './schemas/org-chart-context-schema-v1';
export type { OrgChartMatchCriteriaV1 } from './schemas/org-chart-match-criteria-schema-v1';
export type { OrgChartProfileV1 } from './schemas/org-chart-profile-schema-v1';
export type { OrgChartRuleV1 } from './schemas/org-chart-rule-schema-v1';
export type { OrgChartScopeV1 } from './schemas/org-chart-scope-schema-v1';
export type { OwnerInfoV1 } from './schemas/owner-info-schema-v1';
export type { RegisterSystemRequestV1 } from './schemas/register-system-request-schema-v1';
export type { RequestClaimableRoleScopeV1 } from './schemas/request-claimable-role-scope-schema-v1';
export type { RequestRoleScopeV1 } from './schemas/request-role-scope-schema-v1';
export type { RequestScopeV1 } from './schemas/request-scope-schema-v1';
export type { RoleBindingConfigurationBindingV1 } from './schemas/role-binding-configuration-binding-schema-v1';
export type { RoleBindingV1 } from './schemas/role-binding-schema-v1';
export type { ScopeBindingV1 } from './schemas/scope-binding-schema-v1';
export type { SkipV1 } from './schemas/skip-schema-v1';
export type { SubscriptionRequestV1 } from './schemas/subscription-request-schema-v1';
export type { TopV1 } from './schemas/top-schema-v1';
export type { UpdateAccessRoleAssignmentRequestV1 } from './schemas/update-access-role-assignment-request-schema-v1';
export type { UpdateAccessRoleRequestV1 } from './schemas/update-access-role-request-schema-v1';
export type { UpdateClaimableRoleAssignmentRequestV1 } from './schemas/update-claimable-role-assignment-request-schema-v1';
export type { UpdateClaimableRoleRequestV1 } from './schemas/update-claimable-role-request-schema-v1';
export type { UpdateRoleAssignmentRequestV1 } from './schemas/update-role-assignment-request-schema-v1';
export type { UpdateRoleBindingConfigurationRequestV1 } from './schemas/update-role-binding-configuration-request-schema-v1';
export type { UpdateRoleBindingConfigurationStatusRequestV1 } from './schemas/update-role-binding-configuration-status-request-schema-v1';
export type { UpdateRoleRequestV1 } from './schemas/update-role-request-schema-v1';
export type { UpdateScopeRequestV1 } from './schemas/update-scope-request-schema-v1';
export type { UpdateSystemRequestV1 } from './schemas/update-system-request-schema-v1';
