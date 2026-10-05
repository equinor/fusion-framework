import { buildSchema, type ExecutionResult, GraphQLError, graphql } from 'graphql';

import { isJsonObject } from '../utils/index.js';
import { toAnalyticsMicros } from '../pipeline/format/index.js';
import type { AppFeatureEventRow } from '../types.js';

/** Rows returned when a query does not set `first`, as in Fabric. */
const DEFAULT_PAGE_SIZE = 100;

/** Largest `first` Fabric accepts; `first: -1` returns this many. */
const MAX_PAGE_SIZE = 100_000;

/** Columns compared as points in time rather than as text. */
const DATE_TIME_COLUMNS = new Set(['timestamp', 'event_date', '_ingest_ts']);

/** Columns, in Fabric's order, of the `event_app_feature` type. */
const COLUMNS = [
  'event_name',
  'session_id',
  'user_id',
  'portal_id',
  'module_version',
  'timestamp',
  'event_date',
  'severity_number',
  'event_id',
  '_source_file',
  '_ingest_ts',
  'data_appkey',
  'data_feature',
  'data_body_data',
  'data_context_id',
  'data_context_type',
  'data_context_title',
  'data_context_external_id',
  'data_context_source',
] as const;

type Column = (typeof COLUMNS)[number];

/** GraphQL type of each column. */
const columnType = (column: Column): string =>
  DATE_TIME_COLUMNS.has(column) ? 'DateTime' : column === 'severity_number' ? 'Int' : 'String';

/**
 * The `event_app_features` part of Fabric's GraphQL schema for Fusion analytics, as introspected
 * through the Apps service. `groupBy` is not supported.
 */
const schema = buildSchema(/* GraphQL */ `
  scalar DateTime

  enum OrderBy {
    ASC
    DESC
  }

  type event_app_feature {
    ${COLUMNS.map((column) => `${column}: ${columnType(column)}`).join('\n    ')}
  }

  type event_app_featureConnection {
    items: [event_app_feature!]!
    endCursor: String
    hasNextPage: Boolean!
  }

  input StringFilterInput {
    eq: String
    contains: String
    notContains: String
    startsWith: String
    endsWith: String
    neq: String
    isNull: Boolean
    in: [String]
  }

  input DateTimeFilterInput {
    eq: DateTime
    gt: DateTime
    gte: DateTime
    lt: DateTime
    lte: DateTime
    neq: DateTime
    isNull: Boolean
    in: [DateTime]
  }

  input IntFilterInput {
    eq: Int
    gt: Int
    gte: Int
    lt: Int
    lte: Int
    neq: Int
    isNull: Boolean
    in: [Int]
  }

  input event_app_featureFilterInput {
    ${COLUMNS.map((column) => `${column}: ${columnType(column)}FilterInput`).join('\n    ')}
    and: [event_app_featureFilterInput]
    or: [event_app_featureFilterInput]
  }

  input event_app_featureOrderByInput {
    ${COLUMNS.map((column) => `${column}: OrderBy`).join('\n    ')}
  }

  type Query {
    event_app_features(
      first: Int
      after: String
      filter: event_app_featureFilterInput
      orderBy: event_app_featureOrderByInput
    ): event_app_featureConnection!
  }
`);

/** Arguments of the `event_app_features` query field. */
interface EventAppFeaturesArgs {
  first?: number | null;
  after?: string | null;
  filter?: Record<string, unknown> | null;
  orderBy?: Record<string, 'ASC' | 'DESC' | null> | null;
}

/** A value the filter and sort compare: text, a number, or a point in time in microseconds. */
type Comparable = string | number;

/**
 * Executes a GraphQL request against app-feature events the way Fabric answers the Apps
 * service's `POST /apps/feature-events/query`, so analytics pages and tests can run their real
 * queries against local events.
 *
 * @remarks
 * Supports the `event_app_features` field with `first` (default 100, `-1` for all, at most
 * 100 000), cursor paging with `after`/`endCursor`/`hasNextPage`, every `filter` operator Fabric
 * offers (`eq`, `neq`, `contains`, `notContains`, `startsWith`, `endsWith`, `in`, `isNull`, `gt`,
 * `gte`, `lt`, `lte`, `and`, `or`), `orderBy`, variables, operation names, and introspection.
 * Filters follow SQL semantics: a `null` column only matches `isNull: true`. Text comparison is
 * case-sensitive. Without `orderBy`, rows keep their stored order; sorted ties keep it too.
 *
 * Problems are returned in the GraphQL `errors` list with HTTP 200, as Fabric does.
 *
 * @param rows - The app-feature events to query.
 * @param request - The GraphQL-over-HTTP body: `{ query, variables?, operationName? }`.
 * @returns The GraphQL result.
 *
 * @example
 * ```typescript
 * const result = await executeAppFeatureEventsQuery(rows, {
 *   query: '{ event_app_features(filter: { data_appkey: { eq: "my-app" } }) { items { data_feature } } }',
 * });
 * ```
 */
export async function executeAppFeatureEventsQuery(
  rows: readonly AppFeatureEventRow[],
  request: unknown,
): Promise<ExecutionResult> {
  const body = isJsonObject(request) ? request : {};
  // A request without query text cannot be executed; Fabric answers with a GraphQL error.
  if (typeof body.query !== 'string' || !body.query.trim()) {
    return {
      errors: [
        new GraphQLError('The GraphQL request is empty.', { extensions: { code: 'HC0012' } }),
      ],
    };
  }
  // Variables must be a JSON object when present.
  if (body.variables !== undefined && body.variables !== null && !isJsonObject(body.variables)) {
    return { errors: [new GraphQLError('The GraphQL variables must be an object.')] };
  }

  return graphql({
    schema,
    source: body.query,
    variableValues: isJsonObject(body.variables) ? body.variables : undefined,
    operationName: typeof body.operationName === 'string' ? body.operationName : undefined,
    rootValue: {
      event_app_features: (args: EventAppFeaturesArgs) => selectPage(rows, args),
    },
  });
}

/**
 * Filters, sorts, and pages the rows for one `event_app_features` call.
 *
 * @param rows - All rows.
 * @param args - The field arguments.
 * @returns The connection object.
 * @throws {GraphQLError} For an invalid `first`, cursor, or date-time.
 */
function selectPage(rows: readonly AppFeatureEventRow[], args: EventAppFeaturesArgs) {
  const first = resolvePageSize(args.first);
  const offset = args.after ? decodeCursor(args.after) : 0;
  const { filter, orderBy } = args;
  // Only rows matching the filter are paged.
  const matching = filter ? rows.filter((row) => matchesFilter(row, filter)) : [...rows];
  // Sorting is stable, so rows that compare equal keep their stored order.
  if (orderBy) matching.sort((a, b) => compareRows(a, b, orderBy));

  const items = matching.slice(offset, offset + first);
  const next = offset + items.length;
  const hasNextPage = next < matching.length;
  return { items, hasNextPage, endCursor: hasNextPage ? encodeCursor(next) : null };
}

/**
 * Resolves the page size from `first`, enforcing Fabric's limits.
 *
 * @param first - The `first` argument.
 * @returns The number of rows to return.
 * @throws {GraphQLError} With Fabric's message when `first` is out of range.
 */
function resolvePageSize(first: number | null | undefined): number {
  // An omitted page size uses Fabric's default.
  if (first === undefined || first === null) return DEFAULT_PAGE_SIZE;
  // `-1` asks for the largest page Fabric allows.
  if (first === -1) return MAX_PAGE_SIZE;
  // Zero, other negatives, and oversized pages are rejected with Fabric's wording.
  if (first < 1 || first > MAX_PAGE_SIZE) {
    throw new GraphQLError(
      `Invalid number of items requested, first argument must be either -1 or a positive number within the max page size limit of ${MAX_PAGE_SIZE}. Actual value: ${first}`,
      { extensions: { code: 'BadRequest' } },
    );
  }
  return first;
}

/**
 * Creates an opaque cursor for a row position.
 *
 * @param offset - Index of the next row.
 * @returns The cursor.
 */
function encodeCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ offset })).toString('base64');
}

/**
 * Reads a cursor created by {@link encodeCursor}.
 *
 * @param cursor - The `after` argument.
 * @returns The index of the next row.
 * @throws {GraphQLError} With Fabric's message when the cursor is not one this mock issued.
 */
function decodeCursor(cursor: string): number {
  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch {
    decoded = undefined;
  }
  const offset = isJsonObject(decoded) ? decoded.offset : undefined;
  // Anything but a cursor this mock issued is rejected like an invalid Fabric token.
  if (typeof offset !== 'number' || !Number.isInteger(offset) || offset < 0) {
    throw new GraphQLError(`${cursor} is not a valid pagination token.`, {
      extensions: { code: 'BadRequest' },
    });
  }
  return offset;
}

/**
 * Checks a row against an `event_app_featureFilterInput`. Conditions on different columns, and
 * the items of `and`, must all match; one item of `or` must match.
 *
 * @param row - The row.
 * @param filter - The coerced filter input.
 * @returns Whether the row matches.
 */
function matchesFilter(row: AppFeatureEventRow, filter: Record<string, unknown>): boolean {
  // Every given condition must hold, as the filter's fields are combined with AND.
  return Object.entries(filter).every(([field, condition]) => {
    // A null condition places no constraint, like an omitted one.
    if (condition === null || condition === undefined) return true;
    // `and` needs every nested filter to match.
    if (field === 'and') {
      // Null items in the list place no constraint.
      return (condition as Record<string, unknown>[]).every(
        (nested) => !nested || matchesFilter(row, nested),
      );
    }
    // `or` needs at least one nested filter to match.
    if (field === 'or') {
      // Null items in the list never match on their own.
      return (condition as Record<string, unknown>[]).some(
        (nested) => !!nested && matchesFilter(row, nested),
      );
    }
    return matchesCondition(row, field as Column, condition as Record<string, unknown>);
  });
}

/**
 * Checks one column against its operators, with SQL null semantics.
 *
 * @param row - The row.
 * @param column - The filtered column.
 * @param condition - Operators and operands, such as `{ gte: '2026-01-01' }`.
 * @returns Whether every operator holds.
 * @throws {GraphQLError} When a date-time operand cannot be read.
 */
function matchesCondition(
  row: AppFeatureEventRow,
  column: Column,
  condition: Record<string, unknown>,
): boolean {
  const value = toComparable(column, row[column]);
  // Every operator given for the column must hold.
  return Object.entries(condition).every(([operator, operand]) => {
    // A null operand places no constraint.
    if (operand === null || operand === undefined) return true;
    // `isNull` is the only operator that can match a null column.
    if (operator === 'isNull') return (value === null) === operand;
    // In SQL any other comparison with NULL is unknown, so the row does not match.
    if (value === null) return false;

    // `in` matches when the value equals one of the listed operands.
    if (operator === 'in') {
      // Null list items never equal a value, as in SQL.
      return (operand as unknown[]).some(
        (item) => item !== null && value === toOperand(column, item),
      );
    }
    const target = toOperand(column, operand);
    // Each operator mirrors its SQL comparison; text operators compare case-sensitively.
    switch (operator) {
      case 'eq':
        return value === target;
      case 'neq':
        return value !== target;
      case 'gt':
        return value > target;
      case 'gte':
        return value >= target;
      case 'lt':
        return value < target;
      case 'lte':
        return value <= target;
      case 'contains':
        return String(value).includes(String(target));
      case 'notContains':
        return !String(value).includes(String(target));
      case 'startsWith':
        return String(value).startsWith(String(target));
      case 'endsWith':
        return String(value).endsWith(String(target));
      default:
        return true;
    }
  });
}

/**
 * Converts a stored column value for comparison: date-times to microseconds.
 *
 * @param column - The column.
 * @param value - The stored value.
 * @returns The comparable value, or `null`.
 */
function toComparable(column: Column, value: string | number | null): Comparable | null {
  // Null stays null so SQL null semantics apply.
  if (value === null) return null;
  // Points in time are compared numerically so precision and offsets do not matter.
  if (DATE_TIME_COLUMNS.has(column)) return toAnalyticsMicros(String(value)) ?? null;
  return value;
}

/**
 * Converts a filter operand for comparison with {@link toComparable} values.
 *
 * @param column - The filtered column.
 * @param operand - The operand from the query.
 * @returns The comparable operand.
 * @throws {GraphQLError} When a date-time operand cannot be read.
 */
function toOperand(column: Column, operand: unknown): Comparable {
  // Date-time operands are read like stored timestamps; anything else is a query error.
  if (DATE_TIME_COLUMNS.has(column)) {
    const micros = typeof operand === 'string' ? toAnalyticsMicros(operand) : undefined;
    // An unreadable date-time is reported instead of silently matching nothing.
    if (micros === undefined) {
      throw new GraphQLError(`DateTime cannot parse the given value: ${String(operand)}`, {
        extensions: { code: 'BadRequest' },
      });
    }
    return micros;
  }
  return typeof operand === 'number' ? operand : String(operand);
}

/**
 * Compares two rows by the `orderBy` columns, in schema order. Nulls sort first ascending and
 * last descending, as in SQL Server.
 *
 * @param a - First row.
 * @param b - Second row.
 * @param orderBy - Direction per column.
 * @returns A negative, zero, or positive number.
 */
function compareRows(
  a: AppFeatureEventRow,
  b: AppFeatureEventRow,
  orderBy: Record<string, 'ASC' | 'DESC' | null>,
): number {
  // Columns are compared in turn until one tells the rows apart.
  for (const [column, direction] of Object.entries(orderBy)) {
    // A column without a direction does not take part in sorting.
    if (!direction) continue;
    const left = toComparable(column as Column, a[column as Column]);
    const right = toComparable(column as Column, b[column as Column]);
    // Equal values defer to the next column.
    if (left === right) continue;
    const ascending = left === null ? -1 : right === null ? 1 : left < right ? -1 : 1;
    return direction === 'ASC' ? ascending : -ascending;
  }
  return 0;
}

export default executeAppFeatureEventsQuery;
