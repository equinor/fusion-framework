import type { AnyValue, AnyValueMap, AnalyticsEvent } from '../types.js';
import type { IAnalyticsCollector } from './AnalyticsCollector.interface.js';

import { from, map, type ObservableInput, Subject, type Observer, type Unsubscribable } from 'rxjs';
import { z } from 'zod';

/**
 * Function to create zod schema to be used when collecting
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

export type CollectorSchema<TValue = AnyValue, TAttr = AnyValueMap> = ReturnType<
  typeof createSchema<TValue, TAttr>
>;

/**
 * A base collector to help with parsing the events with provided schema before
 * emitting.
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

  constructor(name: string, schema: CollectorSchema<TValue, TAttr>) {
    this.#name = name;
    this.#schema = schema;
  }

  abstract _initialize(): ObservableInput<{ value: TValue; attributes: TAttr }>;

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

  subscribe(observer: Partial<Observer<z.infer<CollectorSchema<TValue, TAttr>>>>): Unsubscribable {
    return this.#subject.subscribe(observer);
  }
}
