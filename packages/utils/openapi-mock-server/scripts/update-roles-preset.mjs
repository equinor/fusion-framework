import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('../../../services/src/roles/v1/openapi.json', import.meta.url);
const targetUrl = new URL('../src/presets/fusion/rolesv2.openapi.json', import.meta.url);

const operations = {
  '/access-roles': {
    get: 'listAccessRoles',
  },
  '/accounts/{accountIdentifier}/active-access-role-assignments': {
    get: 'listAccountActiveAccessRoleAssignments',
  },
  '/accounts/{accountIdentifier}/claimable-role-assignments': {
    get: 'listAccountClaimableRoleAssignments',
  },
  '/accounts/{accountIdentifier}/consolidated-claimable-role-assignments': {
    get: 'listAccountConsolidatedClaimableRoleAssignments',
  },
  '/accounts/{accountIdentifier}/consolidated-role-assignments': {
    get: 'listAccountConsolidatedRoleAssignments',
  },
  '/accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/activate': {
    post: 'activateClaimableRoleAssignment',
  },
  '/accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/deactivate':
    {
      post: 'deactivateClaimableRoleAssignment',
    },
};

const source = JSON.parse(await readFile(sourceUrl, 'utf8'));
const preset = {
  openapi: source.openapi,
  info: {
    title: 'Fusion Roles V2 API (framework mock preset)',
    version: source.info.version,
    description:
      'Generated from @equinor/fusion-services/roles/v1/openapi.json for the operations consumed by @equinor/fusion-framework-module-roles.',
  },
  paths: {},
  components: {},
};

const referencedComponents = new Set();

const collectReferences = (value) => {
  if (Array.isArray(value)) {
    value.forEach(collectReferences);
    return;
  }
  if (!value || typeof value !== 'object') {
    return;
  }
  if (typeof value.$ref === 'string' && value.$ref.startsWith('#/components/')) {
    referencedComponents.add(value.$ref);
  }
  Object.values(value).forEach(collectReferences);
};

for (const [path, methods] of Object.entries(operations)) {
  const sourcePath = source.paths[path];
  if (!sourcePath) {
    throw new Error(`Roles OpenAPI snapshot is missing ${path}`);
  }
  const targetPath = {};
  if (sourcePath.parameters) {
    targetPath.parameters = structuredClone(sourcePath.parameters);
  }
  for (const [method, operationId] of Object.entries(methods)) {
    const sourceOperation = sourcePath[method];
    if (!sourceOperation) {
      throw new Error(`Roles OpenAPI snapshot is missing ${method.toUpperCase()} ${path}`);
    }
    targetPath[method] = {
      ...structuredClone(sourceOperation),
      operationId,
    };
    collectReferences(targetPath[method]);
  }
  preset.paths[path] = targetPath;
}

for (const reference of referencedComponents) {
  const segments = reference
    .slice(2)
    .split('/')
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'));
  let sourceValue = source;
  let targetValue = preset;
  for (const [index, segment] of segments.entries()) {
    if (!(segment in sourceValue)) {
      throw new Error(`Roles OpenAPI snapshot cannot resolve ${reference}`);
    }
    sourceValue = sourceValue[segment];
    if (index === segments.length - 1) {
      targetValue[segment] = structuredClone(sourceValue);
      collectReferences(sourceValue);
    } else {
      targetValue[segment] ??= {};
      targetValue = targetValue[segment];
    }
  }
}

await writeFile(targetUrl, `${JSON.stringify(preset, null, 2)}\n`);
