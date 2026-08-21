import type { OperationEntry } from '../../types.js';

/** Extracts named path parameters from a compiled pattern's exec match. */
function paramsFromMatch(paramNames: string[], match: RegExpExecArray): Record<string, string> {
  return Object.fromEntries(
    paramNames
      // Pair each declared name with the capture group at the same index.
      .map((name, index) => [name, match[index + 1]]),
  );
}

/**
 * The first indexed operation (and its extracted path params) matching a method and path, if any.
 *
 * @param operations - The indexed operations to search, in priority order.
 * @param method - The HTTP method of the request, matched case-insensitively.
 * @param path - The request path to match against each operation's compiled pattern.
 * @returns The matched operation and its extracted path params, or `undefined` if none match.
 */
export function matchOperation(
  operations: OperationEntry[],
  method: string,
  path: string,
): { entry: OperationEntry; params: Record<string, string> } | undefined {
  const upperMethod = method.toUpperCase();
  const match = operations
    // Only same-method entries can possibly match this request.
    .filter((entry) => entry.method === upperMethod)
    // Try every candidate pattern against the path up front so `.find` can pick the first hit.
    .map((entry) => ({ entry, match: entry.pattern.exec(path) }))
    // The first pattern (by specificity order) whose regex actually matches this path wins.
    .find((candidate): candidate is { entry: OperationEntry; match: RegExpExecArray } =>
      Boolean(candidate.match),
    );
  // No candidate's pattern matched this path at all.
  if (!match) return undefined;
  return { entry: match.entry, params: paramsFromMatch(match.entry.paramNames, match.match) };
}
export default matchOperation;
