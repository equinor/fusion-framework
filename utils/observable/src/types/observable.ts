import { Observable, ObservableInput } from 'rxjs';

export { Observable, ObservableInput };

export type ObservableType<T> = T extends ObservableInput<infer U> ? U : never;
