import type { RolesMockData } from '@equinor/fusion-framework-module-roles/mock';

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1_000).toISOString();

/**
 * Representative Roles V2 data shared by the cookbook app snapshot and local HTTP mock service.
 */
export const rolesMockData = {
  activeRoles: [
    {
      systemName: 'Fusion Apps',
      accessRoleName: 'Fusion.Apps.FullControl',
      assignmentType: 'Direct',
    },
  ],
  claimableRoles: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      claimableRole: {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'ReportExporter',
        displayName: 'Reports exporter',
      },
      reasons: ['Assigned through membership in the Fusion Reports team'],
      type: 'Direct',
      isActive: false,
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1_000).toISOString(),
      scope: {
        isGlobal: false,
        value: 'Reports portfolio',
        scopeTypeIdentifier: 'project',
      },
    },
    {
      id: '77777777-7777-4777-8777-777777777777',
      claimableRole: {
        id: '88888888-8888-4888-8888-888888888888',
        name: 'DataSteward',
        displayName: 'Data steward',
        description: 'Manage data governance workflows.',
      },
      reasons: ['Assigned through membership in the Data Governance team'],
      type: 'Direct',
      isActive: false,
      activeTo: daysAgo(1),
      validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1_000).toISOString(),
      scope: {
        isGlobal: false,
        value: 'Data platform',
        scopeTypeIdentifier: 'project',
      },
    },
    {
      id: '99999999-9999-4999-8999-999999999999',
      claimableRole: {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        name: 'ProjectAdministrator',
        displayName: 'Project administrator',
        description: 'Administer project settings and membership.',
      },
      reasons: ['Assigned as an administrator for Project Aurora'],
      type: 'Direct',
      isActive: false,
      activeTo: daysAgo(3),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000).toISOString(),
      scope: {
        isGlobal: false,
        value: 'Project Aurora',
        scopeTypeIdentifier: 'project',
      },
    },
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      claimableRole: {
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        name: 'AuditReader',
        displayName: 'Audit reader',
        description: 'Review project audit records.',
      },
      reasons: ['Assigned through the Compliance Readers group'],
      type: 'Direct',
      isActive: false,
      activeTo: daysAgo(6),
      scope: {
        isGlobal: true,
        value: null,
      },
    },
  ],
} as const satisfies RolesMockData;
