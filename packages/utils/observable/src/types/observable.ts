import { Observable, ObservableInput } from 'rxjs';

export { Observable, ObservableInput };

/**
 * Extracts the value type `U` from an `ObservableInput<U>`.
 *
 * @template T - The observable input type.
 */
export type ObservableType<T> = T extends ObservableInput<infer U> ? U : never;
