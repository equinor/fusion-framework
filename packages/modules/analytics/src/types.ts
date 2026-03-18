/**
 * Scalar analytics attribute value: a string, number, or boolean.
 *
 * @remarks
 * Mirrors the OpenTelemetry `AnyValue` scalar subset used in log record
 * attributes and event bodies.
 */
export type AnyValueScalar = string | number | boolean;

/** Array of {@link AnyValue} entries, allowing nested attribute structures. */
export type AnyValueArray = Array<AnyValue>;

/**
 * A key–value map where each value is an {@link AnyValue}.
 *
 * Used as the attribute bag on {@link AnalyticsEvent} instances and for
 * nested attribute structures.
 */
export interface AnyValueMap {
  [attributeKey: string]: AnyValue;
}

/**
 * A flexible value type compatible with OpenTelemetry log record bodies and attributes.
 *
 * Can be one of the following:
 * - a scalar value (`string | number | boolean`)
 * - a byte array (`Uint8Array`)
 * - an array of any value ({@link AnyValueArray})
 * - a map from string to any value ({@link AnyValueMap})
 * - `null` or `undefined`
 */
export type AnyValue = AnyValueScalar | Uint8Array | AnyValueArray | AnyValueMap | null | undefined;

/**
 * Represents a single analytics event emitted by a collector and consumed by adapters.
 *
 * @template TValue - The event body type, defaults to {@link AnyValue}.
 * @template TAttr - The attributes map type, defaults to {@link AnyValueMap}.
 *
 * @example
 * ```ts
 * const event: AnalyticsEvent = {
 *   name: 'button-click',
 *   value: 'submit',
 *   attributes: { section: 'header', count: 1 },
 * };
 * ```
 */
export type AnalyticsEvent<
  TValue extends AnyValue = AnyValue,
  TAttr extends AnyValueMap = AnyValueMap,
> = {
  /** Descriptive event name used to categorise the analytic, e.g. `'context-selected'`. */
  name: string;
  /** The primary payload of the event. */
  value: TValue;
  /** Optional metadata attached to the event for filtering and grouping. */
  attributes?: TAttr;
};
