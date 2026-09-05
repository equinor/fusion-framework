import { defineService } from '@equinor/fusion-openapi-mock-server/discovery';

import { rolesMockData } from '../src/roles-mock-data';

const reportExporterAssignment = {
  ...rolesMockData.claimableRoles[0],
  claimableRole: {
    ...rolesMockData.claimableRoles[0].claimableRole,
    accessRoleMappings: [
      {
        accessRole: {
          id: '33333333-3333-4333-8333-333333333333',
          name: 'Reports.Export',
          description: 'Export reports from the cookbook.',
        },
        reason: 'Granted by the Reports exporter claimable role.',
      },
    ],
  },
};

const expiredAssignments = rolesMockData.claimableRoles.slice(1);

const requiredRoleAssignment = {
  id: '44444444-4444-4444-8444-444444444444',
  claimableRole: {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'fusion-developer',
    displayName: 'Fusion developer team member',
    description: 'Grants the development access required by this cookbook.',
    accessRoleMappings: [
      {
        accessRole: {
          id: '66666666-6666-4666-8666-666666666666',
          name: 'ProView.Admin.DevOps',
          description: 'Administer ProView development resources.',
        },
        reason: 'Granted by the Fusion developer team member role.',
      },
    ],
  },
  reasons: ['Granted for the Roles V2 cookbook'],
  type: 'Direct',
  isActive: false,
};

const ACCOUNT_IDENTIFIER = 'fusion-mock-user';
const ACCESS_ROLES_PATH = '/access-roles';
const ACTIVE_ROLES_PATH = `/accounts/${ACCOUNT_IDENTIFIER}/active-access-role-assignments`;
const CLAIMABLE_ROLES_PATH = `/accounts/${ACCOUNT_IDENTIFIER}/consolidated-claimable-role-assignments`;
const CLAIMABLE_ACCESS_ROLES_PATH = `/accounts/${ACCOUNT_IDENTIFIER}/claimable-role-assignments`;
const ACTIVATE_REPORT_EXPORTER_PATH = `${CLAIMABLE_ACCESS_ROLES_PATH}/${reportExporterAssignment.id}/activate`;
const ACTIVATE_REQUIRED_ROLE_PATH = `${CLAIMABLE_ACCESS_ROLES_PATH}/${requiredRoleAssignment.id}/activate`;
const DEACTIVATE_REPORT_EXPORTER_PATH = `${CLAIMABLE_ACCESS_ROLES_PATH}/${reportExporterAssignment.id}/deactivate`;
const DEACTIVATE_REQUIRED_ROLE_PATH = `${CLAIMABLE_ACCESS_ROLES_PATH}/${requiredRoleAssignment.id}/deactivate`;
const activationEnd = (): string => new Date(Date.now() + 2 * 60 * 60 * 1_000).toISOString();

/**
 * Merges deterministic cookbook responses onto the bundled Fusion Roles V2 OpenAPI service.
 */
export default defineService({
  key: 'rolesv2',
  serviceDiscovery: 'merge',
  middleware: (router) => {
    let isRequiredRoleActive = false;
    let isReportExporterActive = false;
    let requiredRoleActiveTo: string | undefined;
    let reportExporterActiveTo: string | undefined;
    const reactivatedExpiredRoleIds = new Set<string>();
    // Preserve each assignment's moving activation end across activation and deactivation requests.
    const expiredRoleActiveTo = new Map(
      expiredAssignments.map((assignment) => [assignment.id, assignment.activeTo]),
    );

    router.get(ACCESS_ROLES_PATH, (_request, response) => {
      response.json({
        totalCount: 2,
        count: 2,
        nextPage: null,
        prevPage: null,
        value: [
          requiredRoleAssignment.claimableRole.accessRoleMappings[0].accessRole,
          reportExporterAssignment.claimableRole.accessRoleMappings[0].accessRole,
        ],
      });
    });
    router.get(ACTIVE_ROLES_PATH, (_request, response) => {
      // Add activated mock roles to the permanent baseline without mutating shared fixtures.
      response.json([
        ...rolesMockData.activeRoles,
        ...(isRequiredRoleActive
          ? [
              {
                systemName: 'ProView',
                accessRoleName: 'ProView.Admin.DevOps',
                assignmentType: 'Claimable',
                activeToDate: requiredRoleActiveTo,
              },
            ]
          : []),
        ...(isReportExporterActive
          ? [
              {
                systemName: 'Reports',
                accessRoleName: 'Reports.Export',
                assignmentType: 'Claimable',
                activeToDate: reportExporterActiveTo,
              },
            ]
          : []),
        // Reactivated shortcuts become ordinary active access-role assignments.
        ...expiredAssignments
          .filter((assignment) => reactivatedExpiredRoleIds.has(assignment.id))
          .map((assignment) => ({
            systemName: 'Fusion',
            accessRoleName: assignment.claimableRole.name,
            assignmentType: 'Claimable',
            activeToDate: expiredRoleActiveTo.get(assignment.id),
          })),
      ]);
    });
    router.get(CLAIMABLE_ROLES_PATH, (_request, response) => {
      // Consolidated assignments retain activation state so consumers can deactivate claimed roles.
      response.json([
        {
          ...requiredRoleAssignment,
          isActive: isRequiredRoleActive,
          activeTo: requiredRoleActiveTo,
        },
        {
          ...rolesMockData.claimableRoles[0],
          isActive: isReportExporterActive,
          activeTo: reportExporterActiveTo,
        },
        ...expiredAssignments.map((assignment) => ({
          ...assignment,
          isActive: reactivatedExpiredRoleIds.has(assignment.id),
          activeTo: expiredRoleActiveTo.get(assignment.id),
        })),
      ]);
    });
    router.get(CLAIMABLE_ACCESS_ROLES_PATH, (_request, response) => {
      // Preserve expanded mappings only for assignments that remain available to activate.
      const value = [
        ...(!isRequiredRoleActive ? [requiredRoleAssignment] : []),
        ...(!isReportExporterActive ? [reportExporterAssignment] : []),
      ];
      response.json({
        totalCount: value.length,
        count: value.length,
        nextPage: null,
        prevPage: null,
        value,
      });
    });
    router.post(ACTIVATE_REQUIRED_ROLE_PATH, (_request, response) => {
      isRequiredRoleActive = true;
      requiredRoleActiveTo = activationEnd();
      response.statusCode = 201;
      response.json({
        id: requiredRoleAssignment.id,
        reason: 'Claimed to load the Fusion Framework Roles cookbook',
        activeToDate: requiredRoleActiveTo,
      });
    });
    router.post(ACTIVATE_REPORT_EXPORTER_PATH, (_request, response) => {
      isReportExporterActive = true;
      reportExporterActiveTo = activationEnd();
      response.statusCode = 201;
      response.json({
        id: reportExporterAssignment.id,
        reason: 'Claimed from the Fusion Framework Roles cookbook',
        activeToDate: reportExporterActiveTo,
      });
    });
    router.post(DEACTIVATE_REQUIRED_ROLE_PATH, (_request, response) => {
      isRequiredRoleActive = false;
      requiredRoleActiveTo = new Date().toISOString();
      response.statusCode = 201;
      response.json({ id: requiredRoleAssignment.id, activeToDate: requiredRoleActiveTo });
    });
    router.post(DEACTIVATE_REPORT_EXPORTER_PATH, (_request, response) => {
      isReportExporterActive = false;
      reportExporterActiveTo = new Date().toISOString();
      response.statusCode = 201;
      response.json({ id: reportExporterAssignment.id, activeToDate: reportExporterActiveTo });
    });
    // Every recent assignment uses the same activation contract as an ordinary claimable role.
    for (const assignment of expiredAssignments) {
      router.post(
        `${CLAIMABLE_ACCESS_ROLES_PATH}/${assignment.id}/activate`,
        (_request, response) => {
          reactivatedExpiredRoleIds.add(assignment.id);
          expiredRoleActiveTo.set(assignment.id, activationEnd());
          response.statusCode = 201;
          response.json({
            id: assignment.id,
            reason: 'Reactivated from the Fusion Framework Roles cookbook',
            activeToDate: expiredRoleActiveTo.get(assignment.id),
          });
        },
      );
      router.post(
        `${CLAIMABLE_ACCESS_ROLES_PATH}/${assignment.id}/deactivate`,
        (_request, response) => {
          reactivatedExpiredRoleIds.delete(assignment.id);
          expiredRoleActiveTo.set(assignment.id, new Date().toISOString());
          response.statusCode = 201;
          response.json({
            id: assignment.id,
            activeToDate: expiredRoleActiveTo.get(assignment.id),
          });
        },
      );
    }
  },
});
