import { Action } from './types';

export class ActionError<TAction extends Action, TCause extends Error = Error> extends Error {
    constructor(public action: TAction, public cause: TCause, msg?: string) {
        super(msg ?? cause.message);
    }
}

export default ActionError;
