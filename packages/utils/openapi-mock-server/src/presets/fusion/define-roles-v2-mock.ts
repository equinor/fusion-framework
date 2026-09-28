import type {
  ActivateAssignedClaimableRoleRequestV1,
  ApiAccountActiveAccessRoleAssignmentV1,
  ApiAccountClaimableRoleAssignmentV1,
  ApiClaimableRoleAssignmentActivationV1,
  ApiConsolidatedClaimableRoleAssignmentV1,
  ApiConsolidatedRoleAssignmentV1,
  ApiExtendedAccessRoleV1,
  ApiPagedCollectionV1,
} from '@equinor/fusion-services/roles';

import { defineService, type MockResponse, type RouteContext } from '../../discovery/index.js';
import type { ServiceMockDefinition } from '../../discovery/discover-services.js';

const ACCOUNT_PATH = '/accounts/:accountIdentifier';
const CLAIMABLE_ASSIGNMENT_PATH = `${ACCOUNT_PATH}/claimable-role-assignments/:assignmentId`;

/** HTTP error returned instead of activating a configured claimable assignment. */
export interface RolesV2MockActivationError {
  /** HTTP error status from 400 through 599. */
  status: number;
  /** JSON response body presented to the Roles client. */
  body: unknown;
}

/** Activation behavior for one claimable role assignment. */
export interface RolesV2MockActivation {
  /**
   * Active access-role assignments added while the claim is active.
   *
   * When omitted, assignments are derived from the claimable role's expanded access-role
   * mappings, system, type, and activation duration.
   */
  activeAccessRoleAssignments?: readonly ApiAccountActiveAccessRoleAssignmentV1[];
  /** Optional deterministic failure used to exercise application recovery and error handling. */
  error?: RolesV2MockActivationError;
}

/** Roles V2 policy and initial state for one mock-auth account/persona. */
export interface RolesV2MockAccount {
  /** Access-role assignments active before any mock activation requests. */
  activeAccessRoleAssignments?: readonly ApiAccountActiveAccessRoleAssignmentV1[];
  /** Full claimable assignments, including expanded access-role mappings used by claimable checks. */
  claimableRoleAssignments?: readonly ApiAccountClaimableRoleAssignmentV1[];
  /**
   * Consolidated claimable assignments shown by assignment overview APIs.
   *
   * When omitted, the helper derives this collection from `claimableRoleAssignments`.
   */
  consolidatedClaimableRoleAssignments?: readonly ApiConsolidatedClaimableRoleAssignmentV1[];
  /** Consolidated standing role assignments for provenance-aware role views. */
  consolidatedRoleAssignments?: readonly ApiConsolidatedRoleAssignmentV1[];
  /** Assignment-specific activation behavior keyed by claimable assignment ID. */
  activations?: Readonly<Record<string, RolesV2MockActivation>>;
}

/** Application-supplied Roles V2 registry and persona/account policy. */
export interface DefineRolesV2MockOptions {
  /** Registered access roles returned by the global paged registry endpoint. */
  accessRoles?: readonly ApiExtendedAccessRoleV1[];
  /**
   * Account policy keyed by the mock-auth `userId`.
   *
   * Account routes require the path identifier and authenticated mock persona to match.
   */
  accounts: Readonly<Record<string, RolesV2MockAccount>>;
  /** Clock override for deterministic activation and expiration tests. */
  now?: () => Date;
}

interface AccountRuntimeState {
  activeAccessRoleAssignments: ApiAccountActiveAccessRoleAssignmentV1[];
  claimableRoleAssignments: ApiAccountClaimableRoleAssignmentV1[];
  consolidatedClaimableRoleAssignments: ApiConsolidatedClaimableRoleAssignmentV1[];
  consolidatedRoleAssignments: ApiConsolidatedRoleAssignmentV1[];
  activatedAccessRoles: Map<string, ApiAccountActiveAccessRoleAssignmentV1[]>;
}

interface AuthorizedAccount {
  accountIdentifier: string;
  account: RolesV2MockAccount;
  state: AccountRuntimeState;
  sessionId: string;
}

/**
 * Clones application-owned fixture data before mutable session state is created.
 *
 * @template TValue - Structured-clone-compatible fixture value.
 * @param value - Fixture value to isolate.
 * @returns An independent clone.
 */
function clone<TValue>(value: TValue): TValue {
  return structuredClone(value);
}

/**
 * Converts claimable assignments into the consolidated shape used by overview APIs.
 *
 * @param assignments - Full account claimable assignments.
 * @returns Consolidated assignment fixtures preserving role and validity metadata.
 */
function deriveConsolidatedAssignments(
  assignments: readonly ApiAccountClaimableRoleAssignmentV1[],
): ApiConsolidatedClaimableRoleAssignmentV1[] {
  // Consolidated reads retain the policy fields needed by role overview and deactivation.
  return assignments.map((assignment) => ({
    id: assignment.id,
    assignedTo: assignment.assignedTo,
    claimableRole: assignment.claimableRole,
    reasons: assignment.reason ? [assignment.reason] : undefined,
    type: assignment.type,
    validFrom: assignment.validFrom,
    validTo: assignment.validTo,
    isActive: assignment.isActive,
    activeTo: assignment.activeTo,
    scope: assignment.scope,
  }));
}

/**
 * Validates configuration that TypeScript cannot guarantee after loading a mock module.
 *
 * @param options - Application-supplied Roles V2 policy.
 * @throws When account keys, assignment IDs, or activation errors are malformed.
 */
function validateOptions(options: DefineRolesV2MockOptions): void {
  const accountEntries = Object.entries(options.accounts);
  // Empty account policy cannot resolve any authenticated persona and is almost always accidental.
  if (accountEntries.length === 0) {
    throw new Error('defineRolesV2Mock requires at least one configured account.');
  }

  // Validate each account once before middleware can expose partial policy.
  for (const [accountIdentifier, account] of accountEntries) {
    // Account keys are compared with both the request path and mock-auth user ID.
    if (!accountIdentifier.trim()) {
      throw new Error('defineRolesV2Mock account identifiers must be non-empty.');
    }

    const assignmentIds = new Set<string>();
    // Mutable activation state requires a stable, unique assignment identity.
    for (const assignment of account.claimableRoleAssignments ?? []) {
      // Missing IDs cannot be addressed by the activation/deactivation endpoint.
      if (!assignment.id?.trim()) {
        throw new Error(
          `defineRolesV2Mock account "${accountIdentifier}" has a claimable assignment without an ID.`,
        );
      }
      // Duplicate IDs would make mutation behavior depend on array order.
      if (assignmentIds.has(assignment.id)) {
        throw new Error(
          `defineRolesV2Mock account "${accountIdentifier}" has duplicate claimable assignment "${assignment.id}".`,
        );
      }
      assignmentIds.add(assignment.id);
      const activation = account.activations?.[assignment.id];
      // Initially active claims need explicit provenance so deactivation removes only their roles.
      if (assignment.isActive === true && !activation?.activeAccessRoleAssignments?.length) {
        throw new Error(
          `defineRolesV2Mock active claimable assignment "${assignment.id}" for account "${accountIdentifier}" requires activations["${assignment.id}"].activeAccessRoleAssignments.`,
        );
      }
    }

    // Activation overrides must target declared assignments and valid HTTP error statuses.
    for (const [assignmentId, activation] of Object.entries(account.activations ?? {})) {
      // Orphan behavior is a configuration typo rather than an invisible no-op.
      if (!assignmentIds.has(assignmentId)) {
        throw new Error(
          `defineRolesV2Mock account "${accountIdentifier}" configures unknown claimable assignment "${assignmentId}".`,
        );
      }
      // Error responses must remain errors instead of success-shaped status codes.
      if (
        activation.error &&
        (!Number.isInteger(activation.error.status) ||
          activation.error.status < 400 ||
          activation.error.status > 599)
      ) {
        throw new Error(
          `defineRolesV2Mock activation error for "${assignmentId}" must use an HTTP status from 400 through 599.`,
        );
      }
    }
  }
}

/**
 * Creates initial mutable state for one browser session and account.
 *
 * @param account - Immutable application-owned account policy.
 * @returns Independent runtime collections for one session/account pair.
 */
function createAccountState(account: RolesV2MockAccount): AccountRuntimeState {
  const claimableRoleAssignments = clone([...(account.claimableRoleAssignments ?? [])]);
  const activeAccessRoleAssignments = clone([...(account.activeAccessRoleAssignments ?? [])]);
  const activatedAccessRoles = new Map<string, ApiAccountActiveAccessRoleAssignmentV1[]>();
  // Initially active claims append explicit effective roles and retain exact removal provenance.
  for (const assignment of claimableRoleAssignments) {
    // Startup validation guarantees active assignments have an ID and explicit effective roles.
    if (assignment.isActive !== true || !assignment.id) continue;
    const effectiveRoles = clone([
      ...(account.activations?.[assignment.id]?.activeAccessRoleAssignments ?? []),
    ]);
    activeAccessRoleAssignments.push(...effectiveRoles);
    activatedAccessRoles.set(assignment.id, effectiveRoles);
  }
  return {
    activeAccessRoleAssignments,
    claimableRoleAssignments,
    consolidatedClaimableRoleAssignments: clone([
      ...(account.consolidatedClaimableRoleAssignments ??
        deriveConsolidatedAssignments(claimableRoleAssignments)),
    ]),
    consolidatedRoleAssignments: clone([...(account.consolidatedRoleAssignments ?? [])]),
    activatedAccessRoles,
  };
}

/**
 * Parses a non-negative integer paging query parameter.
 *
 * @param context - Request context carrying query parameters.
 * @param name - Query parameter name.
 * @param fallback - Value used when the parameter is absent.
 * @returns Parsed integer, or `undefined` when malformed.
 */
function parsePagingParameter(
  context: RouteContext,
  name: '$top' | '$skip',
  fallback: number,
): number | undefined {
  const raw = context.query.get(name);
  // Omitted paging controls use endpoint defaults.
  if (raw === null) return fallback;
  const parsed = Number(raw);
  // Roles paging accepts only finite non-negative integers.
  if (!Number.isInteger(parsed) || parsed < 0) return undefined;
  return parsed;
}

/**
 * Produces a Roles V2 paging envelope for one in-memory collection.
 *
 * @template TValue - Collection item type.
 * @param values - Complete configured collection.
 * @param context - Request context containing `$top` and `$skip`.
 * @param response - Response used for malformed query errors.
 * @returns A page, or `undefined` after writing a validation error.
 */
function createPage<TValue>(
  values: readonly TValue[],
  context: RouteContext,
  response: MockResponse,
): ApiPagedCollectionV1<TValue> | undefined {
  const top = parsePagingParameter(context, '$top', 100);
  const skip = parsePagingParameter(context, '$skip', 0);
  // A zero page size cannot produce a continuation that advances through the collection.
  if (top === undefined || top === 0 || skip === undefined) {
    response.statusCode = 400;
    response.json({
      error: 'Expected $top to be a positive integer and $skip to be non-negative.',
    });
    return undefined;
  }

  const value = values.slice(skip, skip + top);
  const hasNext = skip + value.length < values.length;
  const hasPrevious = skip > 0;
  const nextSkip = skip + value.length;
  const previousSkip = Math.max(0, skip - top);
  return {
    totalCount: values.length,
    count: value.length,
    nextPage: hasNext ? `${context.url.pathname}?$top=${top}&$skip=${nextSkip}` : null,
    prevPage: hasPrevious ? `${context.url.pathname}?$top=${top}&$skip=${previousSkip}` : null,
    value,
  };
}

/**
 * Resolves and authorizes one account request against mock-auth identity state.
 *
 * @param context - Middleware request context.
 * @param response - Response used for authentication and account errors.
 * @param accounts - Immutable configured accounts.
 * @param sessions - Mutable state grouped by opaque mock-auth session and account.
 * @returns Authorized account state, or `undefined` after writing an error.
 */
function authorizeAccount(
  context: RouteContext,
  response: MockResponse,
  accounts: DefineRolesV2MockOptions['accounts'],
  sessions: Map<string, Map<string, AccountRuntimeState>>,
): AuthorizedAccount | undefined {
  // Only bearer tokens issued by the session-scoped mock-auth contract can select policy.
  if (context.identity.status !== 'authenticated') {
    response.statusCode = 401;
    response.json({ error: 'A supported mock-auth bearer token is required.' });
    return undefined;
  }

  const accountIdentifier = context.params.accountIdentifier;
  // Account endpoints always carry the parameterized account identifier.
  if (typeof accountIdentifier !== 'string' || !accountIdentifier) {
    response.statusCode = 400;
    response.json({ error: 'An account identifier is required.' });
    return undefined;
  }
  // A persona cannot read or mutate another configured account by changing the URL.
  if (context.identity.userId !== accountIdentifier) {
    response.statusCode = 403;
    response.json({ error: 'The requested account does not match the mock-auth identity.' });
    return undefined;
  }

  const account = accounts[accountIdentifier];
  // Unknown personas are explicit so missing test policy cannot resemble a no-role account.
  if (!account) {
    response.statusCode = 404;
    response.json({ error: `No Roles V2 mock account configured for "${accountIdentifier}".` });
    return undefined;
  }

  const sessionId = context.identity.sessionId;
  // Roles state isolation requires the session extension, while public middleware identity does not.
  if (!sessionId) {
    response.statusCode = 401;
    response.json({ error: 'A session-scoped mock-auth identity is required.' });
    return undefined;
  }

  let session = sessions.get(sessionId);
  // Each browser context receives an independent mutation map.
  if (!session) {
    session = new Map();
    sessions.set(sessionId, session);
  }
  let state = session.get(accountIdentifier);
  // Identity switches inside one browser session preserve separate state per account.
  if (!state) {
    state = createAccountState(account);
    session.set(accountIdentifier, state);
  }
  return {
    accountIdentifier,
    account,
    state,
    sessionId,
  };
}

/**
 * Authorizes a global registry read through a configured mock-auth persona.
 *
 * @param context - Middleware request context.
 * @param response - Response used for authentication and unknown-account errors.
 * @param accounts - Configured account policy.
 * @returns Whether the registry request may proceed.
 */
function authorizeRegistry(
  context: RouteContext,
  response: MockResponse,
  accounts: DefineRolesV2MockOptions['accounts'],
): boolean {
  // Registry reads still participate in persona-aware recovery and require supported mock auth.
  if (context.identity.status !== 'authenticated') {
    response.statusCode = 401;
    response.json({ error: 'A supported mock-auth bearer token is required.' });
    return false;
  }
  // Missing policy must not look like a configured no-role persona.
  if (!accounts[context.identity.userId]) {
    response.statusCode = 404;
    response.json({
      error: `No Roles V2 mock account configured for "${context.identity.userId}".`,
    });
    return false;
  }
  return true;
}

/**
 * Finds a claimable assignment by its stable route identifier.
 *
 * @param state - Current account runtime state.
 * @param assignmentId - Assignment route parameter.
 * @returns Matching assignment, or `undefined`.
 */
function findClaimableAssignment(
  state: AccountRuntimeState,
  assignmentId: string,
): ApiAccountClaimableRoleAssignmentV1 | undefined {
  // Assignment IDs are unique within an account after startup validation.
  return state.claimableRoleAssignments.find((assignment) => assignment.id === assignmentId);
}

/**
 * Updates activation fields across full and consolidated account collections.
 *
 * @param state - Current account runtime state.
 * @param assignmentId - Assignment being changed.
 * @param isActive - New activation state.
 * @param activeTo - New activation expiration.
 */
function updateActivationState(
  state: AccountRuntimeState,
  assignmentId: string,
  isActive: boolean,
  activeTo: string,
): void {
  // Both endpoint shapes must report the same activation after a mutation.
  state.claimableRoleAssignments = state.claimableRoleAssignments.map((assignment) =>
    assignment.id === assignmentId ? { ...assignment, isActive, activeTo } : assignment,
  );
  // Overview and recovery consumers read the consolidated collection independently.
  state.consolidatedClaimableRoleAssignments = state.consolidatedClaimableRoleAssignments.map(
    (assignment) =>
      assignment.id === assignmentId ? { ...assignment, isActive, activeTo } : assignment,
  );
}

/**
 * Derives active access-role assignments from expanded claimable-role mappings.
 *
 * @param assignment - Activated claimable assignment.
 * @param activeToDate - Activation expiration.
 * @returns Active access-role assignments granted by the claim.
 */
function deriveActiveAccessRoleAssignments(
  assignment: ApiAccountClaimableRoleAssignmentV1,
  activeToDate: string,
): ApiAccountActiveAccessRoleAssignmentV1[] {
  const systemName = assignment.claimableRole?.system?.name;
  return (
    (assignment.claimableRole?.accessRoleMappings ?? [])
      // Expanded mappings are the authoritative access granted by a claimable role.
      .filter((mapping) => Boolean(mapping.accessRole?.name))
      // Activation turns each mapped role into one effective account assignment.
      .map((mapping) => ({
        systemName,
        accessRoleName: mapping.accessRole?.name,
        assignmentType: assignment.type,
        activeToDate,
      }))
  );
}

/**
 * Parses the Roles V2 activation body used by the production client.
 *
 * @param body - Parsed JSON request body.
 * @returns Valid activation input, or `undefined`.
 */
function parseActivationBody(body: unknown): ActivateAssignedClaimableRoleRequestV1 | undefined {
  // The activation contract requires one object with a bounded reason and duration.
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return undefined;
  const { reason, hours } = body as Record<string, unknown>;
  // Match the published Roles V2 request constraints before mutating session state.
  if (
    typeof reason !== 'string' ||
    reason.trim().length === 0 ||
    reason.length > 500 ||
    typeof hours !== 'number' ||
    !Number.isInteger(hours) ||
    hours < 1 ||
    hours > 24
  ) {
    return undefined;
  }
  return { reason, hours };
}

/**
 * Defines a reusable persona-aware Roles V2 HTTP mock for local development and browser tests.
 *
 * @param options - Application-owned access-role registry, account policy, and optional clock.
 * @returns A `rolesv2` merge service that composes with the bundled Fusion preset.
 * @throws When account keys, claimable assignment IDs, or activation errors are malformed.
 *
 * @example
 * ```typescript
 * export default defineRolesV2Mock({
 *   accessRoles: [{ id: 'role-id', name: 'Application.View' }],
 *   accounts: {
 *     'persona-a': {
 *       activeAccessRoleAssignments: [
 *         { systemName: 'Application', accessRoleName: 'Application.View' },
 *       ],
 *     },
 *   },
 * });
 * ```
 */
export function defineRolesV2Mock(options: DefineRolesV2MockOptions): ServiceMockDefinition {
  validateOptions(options);
  const accessRoles = clone(options.accessRoles ?? []);
  const sessions = new Map<string, Map<string, AccountRuntimeState>>();
  const now = options.now ?? (() => new Date());

  return defineService({
    key: 'rolesv2',
    serviceDiscovery: 'merge',
    reset: () => sessions.clear(),
    middleware: (router) => {
      router.get('/access-roles', (_request, response, context) => {
        // Required-role recovery first verifies that configured access roles exist.
        if (!authorizeRegistry(context, response, options.accounts)) return;
        const page = createPage(accessRoles, context, response);
        // Malformed paging has already completed the response.
        if (!page) return;
        response.json(page);
      });

      router.get(
        `${ACCOUNT_PATH}/active-access-role-assignments`,
        (_request, response, context) => {
          const authorized = authorizeAccount(context, response, options.accounts, sessions);
          // Authentication and account failures complete their own response.
          if (!authorized) return;
          response.json(authorized.state.activeAccessRoleAssignments);
        },
      );

      router.get(`${ACCOUNT_PATH}/claimable-role-assignments`, (_request, response, context) => {
        const authorized = authorizeAccount(context, response, options.accounts, sessions);
        // Authentication and account failures complete their own response.
        if (!authorized) return;
        const page = createPage(authorized.state.claimableRoleAssignments, context, response);
        // Malformed paging has already completed the response.
        if (!page) return;
        response.json(page);
      });

      router.get(
        `${ACCOUNT_PATH}/consolidated-claimable-role-assignments`,
        (_request, response, context) => {
          const authorized = authorizeAccount(context, response, options.accounts, sessions);
          // Authentication and account failures complete their own response.
          if (!authorized) return;
          response.json(authorized.state.consolidatedClaimableRoleAssignments);
        },
      );

      router.get(`${ACCOUNT_PATH}/consolidated-role-assignments`, (_request, response, context) => {
        const authorized = authorizeAccount(context, response, options.accounts, sessions);
        // Authentication and account failures complete their own response.
        if (!authorized) return;
        response.json(authorized.state.consolidatedRoleAssignments);
      });

      router.post(`${CLAIMABLE_ASSIGNMENT_PATH}/activate`, (_request, response, context) => {
        const authorized = authorizeAccount(context, response, options.accounts, sessions);
        // Authentication and account failures complete their own response.
        if (!authorized) return;
        const assignmentId = context.params.assignmentId;
        // Parameterized activation routes always require one assignment identity.
        if (typeof assignmentId !== 'string' || !assignmentId) {
          response.statusCode = 400;
          response.json({ error: 'A claimable role assignment ID is required.' });
          return;
        }
        const assignment = findClaimableAssignment(authorized.state, assignmentId);
        // Unknown assignments are not claimable for this account.
        if (!assignment) {
          response.statusCode = 404;
          response.json({ error: `Unknown claimable role assignment "${assignmentId}".` });
          return;
        }
        const activation = authorized.account.activations?.[assignmentId];
        // Application policy may model a deterministic activation failure.
        if (activation?.error) {
          response.statusCode = activation.error.status;
          response.json(activation.error.body);
          return;
        }
        // Repeated activation must not duplicate effective access assignments.
        if (assignment.isActive) {
          response.statusCode = 409;
          response.json({
            error: `Claimable role assignment "${assignmentId}" is already active.`,
          });
          return;
        }
        const input = parseActivationBody(context.body);
        // Invalid input must leave session state unchanged.
        if (!input) {
          response.statusCode = 400;
          response.json({
            error: 'Expected a non-empty reason (max 500 characters) and 1-24 integer hours.',
          });
          return;
        }

        const activationDate = now();
        const activeToDate = new Date(
          activationDate.getTime() + input.hours * 60 * 60 * 1_000,
        ).toISOString();
        const configuredActiveAccessRoleAssignments = clone(
          activation?.activeAccessRoleAssignments ??
            deriveActiveAccessRoleAssignments(assignment, activeToDate),
        );
        // The request duration is authoritative even when policy supplies explicit role shapes.
        const activeAccessRoleAssignments = configuredActiveAccessRoleAssignments.map(
          (activeAssignment) => ({ ...activeAssignment, activeToDate }),
        );
        authorized.state.activatedAccessRoles.set(assignmentId, activeAccessRoleAssignments);
        authorized.state.activeAccessRoleAssignments.push(...activeAccessRoleAssignments);
        updateActivationState(authorized.state, assignmentId, true, activeToDate);

        const result: ApiClaimableRoleAssignmentActivationV1 = {
          id: assignmentId,
          activationDate: activationDate.toISOString(),
          activeToDate,
          reason: input.reason,
        };
        response.statusCode = 201;
        response.json(result);
      });

      router.post(`${CLAIMABLE_ASSIGNMENT_PATH}/deactivate`, (_request, response, context) => {
        const authorized = authorizeAccount(context, response, options.accounts, sessions);
        // Authentication and account failures complete their own response.
        if (!authorized) return;
        const assignmentId = context.params.assignmentId;
        // Parameterized deactivation routes always require one assignment identity.
        if (typeof assignmentId !== 'string' || !assignmentId) {
          response.statusCode = 400;
          response.json({ error: 'A claimable role assignment ID is required.' });
          return;
        }
        const assignment = findClaimableAssignment(authorized.state, assignmentId);
        // Unknown assignments cannot have an activation to end.
        if (!assignment) {
          response.statusCode = 404;
          response.json({ error: `Unknown claimable role assignment "${assignmentId}".` });
          return;
        }
        // Deactivating inactive policy is explicit and leaves baseline roles untouched.
        if (!assignment.isActive) {
          response.statusCode = 409;
          response.json({ error: `Claimable role assignment "${assignmentId}" is not active.` });
          return;
        }

        const activatedAccessRoles = authorized.state.activatedAccessRoles.get(assignmentId) ?? [];
        // Remove only assignments this session activation added, preserving standing grants.
        authorized.state.activeAccessRoleAssignments =
          authorized.state.activeAccessRoleAssignments.filter(
            (activeAssignment) => !activatedAccessRoles.includes(activeAssignment),
          );
        authorized.state.activatedAccessRoles.delete(assignmentId);
        const activeToDate = now().toISOString();
        updateActivationState(authorized.state, assignmentId, false, activeToDate);

        const result: ApiClaimableRoleAssignmentActivationV1 = {
          id: assignmentId,
          activeToDate,
        };
        response.statusCode = 201;
        response.json(result);
      });
    },
  });
}

export default defineRolesV2Mock;
