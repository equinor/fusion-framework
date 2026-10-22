import type { AiOperation, AiReport } from './create-ai-reporter.js';
import { type ExecutionKind, measureExecution } from './measure-execution.js';

/**
 * How one method of an AI client is instrumented: either a measured execution, or a factory
 * whose returned runnable (for example a tool-bound model or a retriever) is instrumented too.
 */
export type InstrumentationPlan = Readonly<
  Record<
    string,
    | { readonly kind: ExecutionKind; readonly operation: AiOperation }
    | { readonly returns: InstrumentationPlan }
  >
>;

/** Reads the caller's abort signal from LangChain-style `(input, options)` arguments. */
const signalOf = (args: unknown[]): AbortSignal | undefined => {
  const options = args[1];
  const signal =
    typeof options === 'object' && options !== null
      ? (options as { signal?: unknown }).signal
      : undefined;
  return signal instanceof AbortSignal ? signal : undefined;
};

/**
 * Wraps an AI client, from a built-in or custom strategy, so its execution methods report
 * terminal outcomes.
 *
 * Planned methods run on the original client, so the client's internal self-calls (such as a
 * default `invoke` delegating to `invoke$`) are not measured twice, and private state keeps
 * working. Other methods run against the wrapper, so LangChain composition (`pipe`, `batch`,
 * `asRunnable`) routes back through the measured methods. Properties, prototype and
 * `instanceof` are those of the original client.
 *
 * @template T - Client type, preserved for callers.
 * @param client - Client returned by a strategy.
 * @param plan - Methods to measure or whose result to instrument.
 * @param report - Isolated outcome reporter.
 * @returns The instrumented client, or the original value when it cannot be wrapped.
 */
export function instrumentAiClient<T>(client: T, plan: InstrumentationPlan, report: AiReport): T {
  // Primitive or missing results cannot carry execution methods.
  if ((typeof client !== 'object' && typeof client !== 'function') || client === null) {
    return client;
  }
  const target = client as object;
  const wrappers = new Map<PropertyKey, unknown>();
  return new Proxy(target, {
    get(obj, property) {
      // Accessors read the original client, so getters over private state keep working.
      const value: unknown = Reflect.get(obj, property, obj);
      // Only the plan's own keys count; inherited names such as `constructor` are not planned.
      const entry =
        typeof property === 'string' && Object.hasOwn(plan, property) ? plan[property] : undefined;
      // Unplanned members and non-callable values pass through untouched.
      if (!entry || typeof value !== 'function') {
        return value;
      }
      const cached = wrappers.get(property);
      // Stable identity per method, so repeated reads compare equal like the original.
      if (cached) {
        return cached;
      }
      const original = value as (...args: unknown[]) => unknown;
      const wrapper =
        'returns' in entry
          ? (...args: unknown[]): unknown =>
              instrumentAiClient(original.apply(obj, args), entry.returns, report)
          : (...args: unknown[]): unknown =>
              measureExecution(entry.kind, entry.operation, report, signalOf(args), () =>
                original.apply(obj, args),
              );
      wrappers.set(property, wrapper);
      return wrapper;
    },
    set(obj, property, value) {
      // Setters over private state must run on the original client, not the wrapper.
      return Reflect.set(obj, property, value, obj);
    },
  }) as T;
}
