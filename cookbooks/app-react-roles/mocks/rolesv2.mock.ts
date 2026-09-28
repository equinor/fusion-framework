import {
  defineRolesV2Mock,
  type RolesV2MockAccount,
} from '@equinor/fusion-openapi-mock-server/presets/fusion';

import { rolesMockData } from '../src/roles-mock-data';

const requiredRoleAssignment = {
  id: '44444444-4444-4444-8444-444444444444',
  claimableRole: {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'fusion-developer',
    displayName: 'Fusion developer team member',
    description: 'Grants the development access required by this cookbook.',
    system: {
      id: 'proview-system',
      name: 'ProView',
    },
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
  reason: 'Granted for the Roles V2 cookbook',
  type: 'Global',
  isActive: false,
  scope: {
    isGlobal: true,
    value: null,
  },
};

const reportExporterAssignment = {
  ...rolesMockData.consolidatedClaimableRoleAssignments[0],
  reason: rolesMockData.consolidatedClaimableRoleAssignments[0].reasons[0],
  claimableRole: {
    ...rolesMockData.consolidatedClaimableRoleAssignments[0].claimableRole,
    system: {
      id: 'reports-system',
      name: 'Reports',
    },
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

const expiredAssignments = rolesMockData.consolidatedClaimableRoleAssignments.slice(1);
// Expired overview shortcuts lack expanded mappings, so their effective grants remain explicit.
const expiredAssignmentActivations = Object.fromEntries(
  expiredAssignments.map((assignment) => [
    assignment.id,
    {
      activeAccessRoleAssignments: [
        {
          systemName: 'Fusion',
          accessRoleName: assignment.claimableRole.name,
          assignmentType: assignment.scope.isGlobal ? 'Global' : 'Scoped',
        },
      ],
    },
  ]),
) satisfies NonNullable<RolesV2MockAccount['activations']>;

const standingAccess = {
  systemName: 'Fusion Apps',
  accessRoleName: 'Fusion.Apps.FullControl',
  assignmentType: 'Global',
};

const requiredAccess = {
  systemName: 'ProView',
  accessRoleName: 'ProView.Admin.DevOps',
  assignmentType: 'Global',
};

/**
 * Builds the cookbook account that demonstrates required-role recovery and claim lifecycle.
 *
 * @returns Account policy with inactive required, ordinary, and expired claimable assignments.
 */
function createRecoveryAccount(): RolesV2MockAccount {
  return {
    activeAccessRoleAssignments: [standingAccess],
    claimableRoleAssignments: [
      requiredRoleAssignment,
      reportExporterAssignment,
      ...expiredAssignments,
    ],
    activations: expiredAssignmentActivations,
  };
}

/**
 * Merges application-owned Roles V2 policy onto the bundled contract.
 *
 * Personas are ordinary typed data. The reusable helper owns endpoint behavior, paging,
 * activation state, identity switching, and browser-session isolation.
 */
export default defineRolesV2Mock({
  accessRoles: [
    {
      id: requiredRoleAssignment.claimableRole.accessRoleMappings[0].accessRole.id,
      name: requiredRoleAssignment.claimableRole.accessRoleMappings[0].accessRole.name,
      description:
        requiredRoleAssignment.claimableRole.accessRoleMappings[0].accessRole.description,
      system: requiredRoleAssignment.claimableRole.system,
    },
    {
      id: reportExporterAssignment.claimableRole.accessRoleMappings[0].accessRole.id,
      name: reportExporterAssignment.claimableRole.accessRoleMappings[0].accessRole.name,
      description:
        reportExporterAssignment.claimableRole.accessRoleMappings[0].accessRole.description,
      system: reportExporterAssignment.claimableRole.system,
    },
  ],
  accounts: {
    'recovery-persona': createRecoveryAccount(),
    'operations-persona': {
      activeAccessRoleAssignments: [standingAccess, requiredAccess],
      claimableRoleAssignments: [reportExporterAssignment],
    },
    'reporting-persona': {
      activeAccessRoleAssignments: [
        requiredAccess,
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Export',
          assignmentType: 'Global',
        },
      ],
      claimableRoleAssignments: [],
    },
  },
});
