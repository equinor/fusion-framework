/**
 * Maps every Roles V2 OpenAPI operation onto the function that implements it.
 *
 * The operation inventory itself comes from the checked-in OpenAPI snapshot, so
 * this table only carries the mapping the contract cannot express: which exported
 * function implements which `"<METHOD> <path>"` operation.
 */
export const ROLES_OPERATION_ENDPOINTS: Readonly<Record<string, string>> = {
  'GET /access-roles': 'listAccessRoles',
  'GET /accounts/{accountIdentifier}/access-role-assignments': 'listAccountAccessRoleAssignments',
  'GET /accounts/{accountIdentifier}/active-access-role-assignments':
    'listAccountActiveAccessRoleAssignments',
  'GET /accounts/{accountIdentifier}/claimable-role-assignments':
    'listAccountClaimableRoleAssignments',
  'POST /accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/activate':
    'activateClaimableRoleAssignment',
  'GET /accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/activations/{claimableRoleAssignmentActivationId}':
    'getClaimableRoleAssignmentActivation',
  'POST /accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/deactivate':
    'deactivateClaimableRoleAssignment',
  'GET /accounts/{accountIdentifier}/consolidated-claimable-role-assignments':
    'listAccountConsolidatedClaimableRoleAssignments',
  'GET /accounts/{accountIdentifier}/consolidated-role-assignments':
    'listAccountConsolidatedRoleAssignments',
  'GET /accounts/{accountIdentifier}/role-assignments': 'listAccountRoleAssignments',
  'GET /claimable-role-assignment-activations': 'listClaimableRoleAssignmentActivations',
  'DELETE /claimable-role-assignments/{externalIdentifier}':
    'deleteClaimableRoleAssignmentsByExternalIdentifier',
  'GET /claimable-roles': 'listClaimableRoles',
  'POST /claimable-roles': 'createClaimableRole',
  'DELETE /claimable-roles/{claimableRoleIdentifier}': 'deleteClaimableRole',
  'GET /claimable-roles/{claimableRoleIdentifier}': 'getClaimableRole',
  'PATCH /claimable-roles/{claimableRoleIdentifier}': 'updateClaimableRole',
  'POST /claimable-roles/{claimableRoleIdentifier}/access-roles': 'addClaimableRoleAccessRoles',
  'DELETE /claimable-roles/{claimableRoleIdentifier}/access-roles/{accessRoleIdentifier}':
    'deleteClaimableRoleAccessRole',
  'GET /claimable-roles/{claimableRoleIdentifier}/assignments': 'listClaimableRoleAssignments',
  'POST /claimable-roles/{claimableRoleIdentifier}/assignments': 'assignClaimableRole',
  'DELETE /claimable-roles/{claimableRoleIdentifier}/assignments/{claimableRoleAssignmentId}':
    'deleteClaimableRoleAssignment',
  'GET /claimable-roles/{claimableRoleIdentifier}/assignments/{claimableRoleAssignmentId}':
    'getClaimableRoleAssignment',
  'PATCH /claimable-roles/{claimableRoleIdentifier}/assignments/{claimableRoleAssignmentId}':
    'updateClaimableRoleAssignment',
  'GET /claimable-roles/{claimableRoleIdentifier}/assignments/{claimableRoleAssignmentId}/activations':
    'listActivationsForClaimableRoleAssignment',
  'GET /public/schemas/{type}': 'getPublicSchema',
  'DELETE /role-assignments/{externalIdentifier}': 'deleteRoleAssignmentsByExternalIdentifier',
  'GET /role-binding-configurations': 'listRoleBindingConfigurations',
  'POST /role-binding-configurations': 'createRoleBindingConfiguration',
  'DELETE /role-binding-configurations/history/expired':
    'purgeExpiredRoleBindingConfigurationHistory',
  'DELETE /role-binding-configurations/{identifier}': 'deleteRoleBindingConfiguration',
  'GET /role-binding-configurations/{identifier}': 'getRoleBindingConfiguration',
  'PATCH /role-binding-configurations/{identifier}': 'updateRoleBindingConfiguration',
  'GET /role-binding-configurations/{identifier}/history': 'listRoleBindingConfigurationHistory',
  'POST /role-binding-configurations/{identifier}/history':
    'createRoleBindingConfigurationHistoryRecord',
  'GET /role-binding-configurations/{identifier}/notifications':
    'listRoleBindingConfigurationNotifications',
  'POST /role-binding-configurations/{identifier}/notifications':
    'createRoleBindingConfigurationNotificationRecord',
  'GET /role-binding-configurations/{identifier}/status': 'getRoleBindingConfigurationStatus',
  'PATCH /role-binding-configurations/{identifier}/status': 'updateRoleBindingConfigurationStatus',
  'GET /roles': 'listRoles',
  'POST /roles': 'createRole',
  'DELETE /roles/{roleIdentifier}': 'deleteRole',
  'GET /roles/{roleIdentifier}': 'getRole',
  'PATCH /roles/{roleIdentifier}': 'updateRole',
  'POST /roles/{roleIdentifier}/access-roles': 'addRoleAccessRoles',
  'DELETE /roles/{roleIdentifier}/access-roles/{accessRoleIdentifier}': 'deleteRoleAccessRole',
  'GET /roles/{roleIdentifier}/assignments': 'listRoleAssignments',
  'POST /roles/{roleIdentifier}/assignments': 'assignRole',
  'POST /roles/{roleIdentifier}/assignments/delete': 'deleteRoleAssignments',
  'DELETE /roles/{roleIdentifier}/assignments/{roleAssignmentId}': 'deleteRoleAssignment',
  'GET /roles/{roleIdentifier}/assignments/{roleAssignmentId}': 'getRoleAssignment',
  'PATCH /roles/{roleIdentifier}/assignments/{roleAssignmentId}': 'updateRoleAssignment',
  'GET /scope-types': 'listScopeTypes',
  'POST /scope-types': 'createScopeType',
  'DELETE /scope-types/{scopeTypeIdentifier}': 'deleteScopeType',
  'GET /scope-types/{scopeTypeIdentifier}': 'getScopeType',
  'PATCH /scope-types/{scopeTypeIdentifier}': 'updateScopeType',
  'PUT /subscriptions/roles-v2': 'putRolesSubscription',
  'GET /systems': 'listSystems',
  'POST /systems': 'createSystem',
  'DELETE /systems/{systemIdentifier}': 'deleteSystem',
  'GET /systems/{systemIdentifier}': 'getSystem',
  'PATCH /systems/{systemIdentifier}': 'updateSystem',
  'GET /systems/{systemIdentifier}/access-roles': 'listSystemAccessRoles',
  'POST /systems/{systemIdentifier}/access-roles': 'createSystemAccessRole',
  'DELETE /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}':
    'deleteSystemAccessRole',
  'GET /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}': 'getSystemAccessRole',
  'PATCH /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}': 'updateSystemAccessRole',
  'GET /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments':
    'listSystemAccessRoleAssignments',
  'POST /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments':
    'assignSystemAccessRole',
  'DELETE /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments/{accessRoleAssignmentId}':
    'deleteSystemAccessRoleAssignment',
  'GET /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments/{accessRoleAssignmentId}':
    'getSystemAccessRoleAssignment',
  'PATCH /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments/{accessRoleAssignmentId}':
    'updateSystemAccessRoleAssignment',
};
