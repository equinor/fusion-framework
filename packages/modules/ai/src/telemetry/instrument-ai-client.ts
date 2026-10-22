import { Runnable, RunnableBinding } from '@langchain/core/runnables';
import { BaseService } from '../lib/BaseService.js';
import type { AiOperation, AiReport } from './types.js';
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

/** A callable member of an AI client. */
type Method = (...args: unknown[]) => unknown;

/**
 * LangChain composition methods (`batch`, `pipe`, `asRunnable`, ...) inherited unchanged from
 * these base classes only call the client's public runnable methods, so running them on the
 * wrapper routes composition back through the measured entry points.
 */
const compositionBases: readonly object[] = [Runnable.prototype, BaseService.prototype];

const isInheritedComposition = (property: PropertyKey, method: unknown): boolean =>
  // Same function object as a base class member means the client did not override it.
  compositionBases.some((base) => Reflect.get(base, property) === method);

/**
 * Decides how one client method behaves behind the wrapper.
 *
 * @param method - The client's own implementation.
 * @param entry - Plan entry for the method, when it is planned.
 * @param property - Member name, used to recognise inherited composition methods.
 * @param client - Original client, the receiver for planned and custom methods.
 * @param report - Isolated outcome reporter.
 * @returns The member to expose on the wrapper.
 */
function wrapMethod(
  method: Method,
  entry: InstrumentationPlan[string] | undefined,
  property: PropertyKey,
  client: object,
  report: AiReport,
): Method {
  // Factories such as `bindTools` or `asRetriever` return a runnable that is instrumented too.
  if (entry && 'returns' in entry) {
    return (...args) => instrumentAiClient(method.apply(client, args), entry.returns, report);
  }
  // Measured executions run on the original client, so its own self-calls are not re-measured.
  if (entry) {
    return (...args) =>
      measureExecution(entry.kind, entry.operation, report, signalOf(args), () =>
        method.apply(client, args),
      );
  }
  // A binding's batch hands inputs to the raw bound runnable; the generic batch runs on the
  // wrapper and calls the measured `invoke` once per input, honouring the same batch options.
  if (method === RunnableBinding.prototype.batch) {
    return Runnable.prototype.batch as Method;
  }
  // Unchanged LangChain composition runs on the wrapper and reaches the measured methods.
  if (isInheritedComposition(property, method)) {
    return method;
  }
  // Custom members keep their original receiver, so private state such as `#fields` works.
  return method.bind(client);
}

/**
 * Wraps an AI client, from a built-in or custom strategy, so its execution methods report
 * terminal outcomes.
 *
 * Planned methods and custom members run on the original client, so private state keeps
 * working and the client's internal self-calls (such as a default `invoke` delegating to
 * `invoke$`) are not measured twice. Composition methods inherited unchanged from LangChain's
 * `Runnable` (`pipe`, `batch`, `asRunnable`, ...) run on the wrapper, so they reach the measured
 * methods; a `RunnableBinding` batch uses that generic batch too. Read-only, non-configurable
 * own methods are returned unwrapped, as Proxy invariants require. Properties, prototype and
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
  const wrapped = new Map<PropertyKey, { method: Method; member: Method }>();
  return new Proxy(target, {
    get(obj, property) {
      // Accessors read the original client, so getters over private state keep working.
      const value: unknown = Reflect.get(obj, property, obj);
      const own = Reflect.getOwnPropertyDescriptor(obj, property);
      // Proxy invariants require read-only, non-configurable own members to be returned as is.
      if (own?.configurable === false && own.writable === false) {
        return value;
      }
      // Data properties and the class reference pass through untouched.
      if (typeof value !== 'function' || property === 'constructor') {
        return value;
      }
      const cached = wrapped.get(property);
      // Stable identity per method, as long as the client has not replaced it.
      if (cached?.method === value) {
        return cached.member;
      }
      // Only the plan's own keys count; inherited names such as `constructor` are not planned.
      const entry =
        typeof property === 'string' && Object.hasOwn(plan, property) ? plan[property] : undefined;
      const member = wrapMethod(value as Method, entry, property, obj, report);
      wrapped.set(property, { method: value as Method, member });
      return member;
    },
    set(obj, property, value) {
      // Setters over private state must run on the original client, not the wrapper.
      return Reflect.set(obj, property, value, obj);
    },
  }) as T;
}
