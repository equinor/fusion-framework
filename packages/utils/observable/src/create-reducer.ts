import { produce as createNextState, isDraft, isDraftable } from 'immer';

import type { Draft } from 'immer';

import type { TypeGuard } from './types/ts-helpers';
import type { Action, ActionType, AnyAction, ExtractAction } from './types/actions';
import type { ReducerWithInitialState } from './types/reducers';

function freezeDraftable<T>(val: T) {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: This is a valid use case for an empty block statement
  return isDraftable(val) ? createNextState(val, () => {}) : val;
}

// biome-ignore lint/complexity/noBannedTypes: This is a valid use case for an empty object type
type NotFunction<T = unknown> = T extends Function ? never : T;

function isStateFunction<S>(x: unknown): x is () => S {
  return typeof x === 'function';
}

export type ActionMatcherDescription<S, A extends AnyAction> = {
  matcher: TypeGuard<A> | ((action: A) => boolean);
  reducer: CaseReducer<S, NoInfer<A>>;
};

// biome-ignore lint/suspicious/noExplicitAny: This is a valid use case for any
type ActionMatcherDescriptionCollection<S> = Array<ActionMatcherDescription<S, any>>;

interface TypedActionCreator<Type extends string> {
  // biome-ignore lint/suspicious/noExplicitAny: This is a valid use case for any
  (...args: any[]): Action<Type>;
  type: Type;
}

type CaseReducer<S = unknown, A extends Action = AnyAction> = (
  state: Draft<S>,
  action: A,
  // biome-ignore lint/suspicious/noConfusingVoidType: This is a valid use case for void
) => S | void | Draft<S>;

type CaseReducers<S, AS extends Record<string, Action>> = {
  // biome-ignore lint/suspicious/noConfusingVoidType: This is a valid use case for void
  [T in keyof AS]: AS[T] extends Action ? CaseReducer<S, AS[T]> : void;
};

/**
 * A utility function that allows defining a reducer as a mapping from action
 * type to *case reducer* functions that handle these action types. The
 * reducer's initial state is passed as the first argument.
 *
 * @remarks
 * The body of every case reducer is implicitly wrapped with a call to
 * `produce()` from the [immer](https://github.com/mweststrate/immer) library.
 * This means that rather than returning a new state object, you can also
 * mutate the passed-in state object directly; these mutations will then be
 * automatically and efficiently translated into copies, giving you both
 * convenience and immutability.
 *
 * @overloadSummary
 * This overload accepts a callback function that receives a `builder` object as its argument.
 * That builder provides `addCase`, `addMatcher` and `addDefaultCase` functions that may be
 * called to define what actions this reducer will handle.
 *
 * @param initialState - `State | (() => State)`: The initial state that should be used when the reducer is called the first time. This may also be a "lazy initializer" function, which should return an initial state value when called. This will be used whenever the reducer is called with `undefined` as its state value, and is primarily useful for cases like reading initial state from `localStorage`.
 * @param builderCallback - `(builder: Builder) => void` A callback that receives a *builder* object to define
 *   case reducers via calls to `builder.addCase(actionCreatorOrType, reducer)`.
 *
 * @public
 */
export function createReducer<S extends NotFunction, A extends Action = AnyAction>(
  initialState: S | (() => S),
  builderCallback: (builder: ActionReducerMapBuilder<S, A>) => void,
): ReducerWithInitialState<S, A>;

export function createReducer<S extends NotFunction, A extends Action = AnyAction>(
  initialState: S | (() => S),
  mapOrBuilderCallback: (builder: ActionReducerMapBuilder<S, A>) => void,
): ReducerWithInitialState<S, A> {
  const [actionsMap, finalActionMatchers, finalDefaultCaseReducer] =
    executeReducerBuilderCallback(mapOrBuilderCallback);

  // Ensure the initial state gets frozen either way (if draftable)
  let getInitialState: () => S;
  if (isStateFunction(initialState)) {
    getInitialState = () => freezeDraftable(initialState());
  } else {
    const frozenInitialState = freezeDraftable(initialState);
    getInitialState = () => frozenInitialState;
  }

  function reducer(state: S, action: A): S {
    let caseReducers = [
      actionsMap[action.type],
      ...finalActionMatchers.filter(({ matcher }) => matcher(action)).map(({ reducer }) => reducer),
    ];
    if (finalDefaultCaseReducer && caseReducers.filter((cr) => !!cr).length === 0) {
      caseReducers = [finalDefaultCaseReducer];
    }

    return caseReducers.reduce((previousState, caseReducer): S => {
      if (caseReducer) {
        if (isDraft(previousState)) {
          // If it's already a draft, we must already be inside a `createNextState` call,
          // likely because this is being wrapped in `createReducer`, `createSlice`, or nested
          // inside an existing draft. It's safe to just pass the draft to the mutator.
          const draft = previousState as Draft<S>; // We can assume this is already a draft
          const result = caseReducer(draft, action);

          if (result === undefined) {
            return previousState;
          }

          return result as S;
        } else if (!isDraftable(previousState)) {
          // If state is not draftable (ex: a primitive, such as 0), we want to directly
          // return the caseReducer func and not wrap it with produce.
          const result = caseReducer(previousState as unknown as Draft<S>, action);

          if (result === undefined) {
            if (previousState === null) {
              return previousState;
            }
            throw Error('A case reducer on a non-draftable value must not return undefined');
          }

          return result as S;
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // createNextState() produces an Immutable<Draft<S>> rather
          // than an Immutable<S>, and TypeScript cannot find out how to reconcile
          // these two types.
          return createNextState(previousState, (draft: Draft<S>) => {
            return caseReducer(draft, action);
          });
        }
      }

      return previousState;
    }, state ?? getInitialState());
  }

  reducer.getInitialState = getInitialState;

  return reducer as ReducerWithInitialState<S, A>;
}

/**
 * A builder for an action <-> reducer map.
 *
 * @public
 */
export interface ActionReducerMapBuilder<State, Actions extends AnyAction = AnyAction> {
  /**
   * Adds a case reducer to handle a single exact action type.
   * @remarks
   * All calls to `builder.addCase` must come before any calls to `builder.addMatcher` or `builder.addDefaultCase`.
   * @param actionCreator - Either a plain action type string, or an action creator generated by [`createAction`](./createAction) that can be used to determine the action type.
   * @param reducer - The actual case reducer function.
   */
  addCase<ActionCreator extends TypedActionCreator<ActionType<Actions>>>(
    actionCreator: ActionCreator,
    reducer: CaseReducer<State, ReturnType<ActionCreator>>,
  ): ActionReducerMapBuilder<State, Actions>;

  /**
   * Adds a case reducer to handle a single exact action type.
   * @remarks
   * All calls to `builder.addCase` must come before any calls to `builder.addMatcher` or `builder.addDefaultCase`.
   * @param actionCreator - Either a plain action type string, or an action creator generated by [`createAction`](./createAction) that can be used to determine the action type.
   * @param reducer - The actual case reducer function.
   */
  addCase<Type extends Actions['type']>(
    type: Type,
    reducer: CaseReducer<State, ExtractAction<Actions, Type>>,
  ): ActionReducerMapBuilder<State, Actions>;

  // /**
  //  * Adds a case reducer to handle a single exact action type.
  //  * @remarks
  //  * All calls to `builder.addCase` must come before any calls to `builder.addMatcher` or `builder.addDefaultCase`.
  //  * @param actionCreator - Either a plain action type string, or an action creator generated by [`createAction`](./createAction) that can be used to determine the action type.
  //  * @param reducer - The actual case reducer function.
  //  */
  // addCase(
  //   type: string,
  //   reducer: CaseReducer<State, Actions>,
  // ): ActionReducerMapBuilder<State, Actions>;

  /**
   * Allows you to match your incoming actions against your own filter function instead of only the `action.type` property.
   * @remarks
   * If multiple matcher reducers match, all of them will be executed in the order
   * they were defined in - even if a case reducer already matched.
   * All calls to `builder.addMatcher` must come after any calls to `builder.addCase` and before any calls to `builder.addDefaultCase`.
   * @param matcher - A matcher function. In TypeScript, this should be a [type predicate](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates)
   *   function
   * @param reducer - The actual case reducer function.
   *
   */
  addMatcher<TAction extends Actions = Actions>(
    matcher: (action: Actions) => action is TAction,
    reducer: CaseReducer<State, TAction extends AnyAction ? TAction : TAction & AnyAction>,
  ): Omit<ActionReducerMapBuilder<State, Actions>, 'addCase'>;

  addMatcher<TAction extends Actions = Actions>(
    matcher: (action: Actions) => boolean,
    reducer: CaseReducer<State, TAction extends AnyAction ? TAction : TAction & AnyAction>,
  ): Omit<ActionReducerMapBuilder<State, Actions>, 'addCase'>;

  /**
   * Adds a "default case" reducer that is executed if no case reducer and no matcher
   * reducer was executed for this action.
   * @param reducer - The fallback "default case" reducer function.
   */
  addDefaultCase(reducer: CaseReducer<State, AnyAction>): void;
}

export function executeReducerBuilderCallback<TState, TAction extends AnyAction>(
  builderCallback: (builder: ActionReducerMapBuilder<TState, TAction>) => void,
): [
  CaseReducers<TState, Record<string, TAction>>,
  ActionMatcherDescriptionCollection<TState>,
  CaseReducer<TState, TAction> | undefined,
] {
  const actionsMap: Record<string, CaseReducer<TState, TAction>> = {};
  const actionMatchers: ActionMatcherDescriptionCollection<TState> = [];
  let defaultCaseReducer: CaseReducer<TState, TAction> | undefined;

  const builder: ActionReducerMapBuilder<TState> = {
    addCase(
      typeOrActionCreator: string | TypedActionCreator<string>,
      reducer: CaseReducer<TState, Action>,
    ) {
      if (process.env.NODE_ENV !== 'production') {
        /*
         * to keep the definition by the user in line with actual behavior,
         * we enforce `addCase` to always be called before calling `addMatcher`
         * as matching cases take precedence over matchers
         */
        if (actionMatchers.length > 0) {
          throw new Error(
            '`builder.addCase` should only be called before calling `builder.addMatcher`',
          );
        }
        if (defaultCaseReducer) {
          throw new Error(
            '`builder.addCase` should only be called before calling `builder.addDefaultCase`',
          );
        }
      }
      const type =
        typeof typeOrActionCreator === 'string' ? typeOrActionCreator : typeOrActionCreator.type;
      if (type in actionsMap) {
        throw new Error('addCase cannot be called with two reducers for the same action type');
      }
      actionsMap[type] = reducer as CaseReducer<TState, TAction>;
      return builder;
    },
    addMatcher<A>(
      matcher: TypeGuard<A>,
      reducer: CaseReducer<TState, A extends AnyAction ? A : TAction>,
    ) {
      if (process.env.NODE_ENV !== 'production') {
        if (defaultCaseReducer) {
          throw new Error(
            '`builder.addMatcher` should only be called before calling `builder.addDefaultCase`',
          );
        }
      }
      actionMatchers.push({ matcher, reducer });
      return builder;
    },
    addDefaultCase(reducer: CaseReducer<TState, AnyAction>) {
      if (process.env.NODE_ENV !== 'production') {
        if (defaultCaseReducer) {
          throw new Error('`builder.addDefaultCase` can only be called once');
        }
      }
      defaultCaseReducer = reducer;
      return builder;
    },
  };
  builderCallback(builder as ActionReducerMapBuilder<TState, TAction>);
  return [
    actionsMap as CaseReducers<TState, Record<string, TAction>>,
    actionMatchers,
    defaultCaseReducer,
  ];
}
