import { Observable, ObservableInput } from 'rxjs';

export { Observable, ObservableInput };

export type ObservableType<T> = T extends Observable<infer U> ? U : never;
