export type TypeConstant = string;

export type Action<T extends TypeConstant = TypeConstant> = { type: T };

/**
 * An Action type which accepts any other properties.
 * This is mainly for the use of the `Reducer` type.
 * This is not part of `Action` itself to prevent types that extend `Action` from
 * having an index signature.
 */
export interface AnyAction extends Action {
    // Allows any extra properties to be defined in an action.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [extraProps: string]: any;
}

export type PayloadAction<T extends TypeConstant = TypeConstant, P = unknown> = Action<T> & {
    payload: P;
};

export type MetaAction<T extends TypeConstant = TypeConstant, M = unknown> = Action<T> & {
    meta: M;
};

export type PayloadMetaAction<
    TType extends TypeConstant = TypeConstant,
    TPayload = unknown,
    TMeta = unknown
> = PayloadAction<TType, TPayload> & MetaAction<TType, TMeta>;

export type ActionType<T extends Action> = T['type'];
export type ActionMeta<T extends MetaAction> = T['meta'];
export type ActionPayload<T extends PayloadAction> = T['payload'];

export type ExtractAction<
    TAction extends Action,
    TType extends TypeConstant = ActionType<TAction>
> = Extract<TAction, Action<TType>>;
