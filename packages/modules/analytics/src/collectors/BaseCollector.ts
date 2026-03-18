import type { AnyValue, AnyValueMap, AnalyticsEvent } from '../types.js';
import type { IAnalyticsCollector } from './AnalyticsCollector.interface.js';

import { from, map, type ObservableInput, Subject, type Observer, type Unsubscribable } from 'rxjs';
import { z } from 'zod';

/**
 * Creates a Zod schema for validating {@link AnalyticsEvent} instances with
 * typed value and attributes.
 *
 * @template TValue - Schema type for the event body.
 * @template TAttr - Schema type for the event attributes.
 * @param value - Zod schema validating the event body.
 * @param attributes - Zod schema validating the event attributes.
 * @returns A Zod object schema matching `{ name, value, attributes? }`.
 */
export const createSchema = <TValue = AnyValue, TAttr = AnyValueMap>(
  value: z.ZodSchema<TValue>,
  attributes: z.ZodSchema<TAttr>,
) => {
  return z.object({
    name: z.string(),
    value: value,
    attributes: attributes.optional(),
  });
};

/** Inferred Zod schema type produced by {@link createSchema}. */
export type CollectorSchema<TValue = AnyValue, TAttr = AnyValueMap> = ReturnType<
  typeof createSchema<TValue, TAttr>
>;

/**
 * Abstract base class for analytics collectors that validates events against a
 * Zod schema before emitting.
 *
 * @remarks
 * Subclasses implement {@link BaseCollector._initialize | _initialize} to return
 * an observable of raw `{ value, attributes }` objects. `BaseCollector` wraps
 * each emission with the collector name, validates it against the supplied schema,
 * and publishes through an internal `Subject`.
 *
 * @template TValue - The event body type.
 * @template TAttr - The event attributes type.
 *
 * @example
 * ```ts
 * class MyCollector extends BaseCollector<string, { page: string }> {
 *   constructor() {
 *     super('my-event', createSchema(z.string(), z.object({ page: z.string() })));
 *   }
 *   _initialize() {
 *     return of({ value: 'hello', attributes: { page: '/home' } });
 *   }
 * }
 * ```
 */
export abstract class BaseCollector<
  TValue extends AnyValue,
  TAttr extends AnyValueMap = AnyValueMap,
> implements IAnalyticsCollector<AnalyticsEvent<TValue, TAttr>>
{
  #schema: CollectorSchema<TValue, TAttr>;
  #name: string;
  #subject: Subject<z.infer<CollectorSchema<TValue, TAttr>>> = new Subject<
    z.infer<CollectorSchema<TValue, TAttr>>
  >();

  /**
   * Creates a new `BaseCollector`.
   *
   * @param name - Event name assigned to every emission (e.g. `'context-selected'`).
   * @param schema - Zod schema used to validate each event before publishing.
   */
  constructor(name: string, schema: CollectorSchema<TValue, TAttr>) {
    this.#name = name;
    this.#schema = schema;
  }

  /**
   * Returns an observable source of raw `{ value, attributes }` objects.
   *
   * @remarks
   * Subclasses implement this to provide the domain-specific event stream.
   * The base class wraps the output with the collector name and validates it.
   *
   * @returns An observable input of value/attribute pairs.
   */
  abstract _initialize(): ObservableInput<{ value: TValue; attributes: TAttr }>;

  /**
   * Subscribes to the source returned by {@link BaseCollector._initialize},
   * validates each emission with the Zod schema, and publishes through the
   * internal subject.
   */
  initialize(): Promise<void> | void {
    from(this._initialize())
      .pipe(
        map(({ value, attributes }) => {
          return {
            name: this.#name,
            value: value,
            attributes: attributes,
          };
        }),
        map((x) => this.#schema.parse(x)),
      )
      .subscribe(this.#subject);
  }

  /**
   * Subscribes an observer to the validated event stream.
   *
   * @param observer - Partial observer receiving validated events.
   * @returns An `Unsubscribable` handle.
   */
  subscribe(observer: Partial<Observer<z.infer<CollectorSchema<TValue, TAttr>>>>): Unsubscribable {
    return this.#subject.subscribe(observer);
  }
}
