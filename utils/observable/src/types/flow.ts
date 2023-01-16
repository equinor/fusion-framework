import { Observable, ObservableInput } from 'rxjs';
import { AnyAction } from './actions';

export type Flow<TAction extends AnyAction, TState = unknown> = (
    action: Observable<TAction>,
    state: Observable<TState>
) => Observable<TAction>;

export type Effect<TAction extends AnyAction, TState = unknown> = (
    action: TAction,
    state: TState
) => ObservableInput<TAction | void> | TAction | void;
