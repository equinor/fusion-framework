import { from, Observable } from 'rxjs';
import { last, mergeScan } from 'rxjs/operators';

export type ProcessOperator<T, R = T> = (request: T) => R | void | Promise<R | void>;

/**
 * Container for sync/async operators.
 * Pipes each operator sequential
 */
export class ProcessOperators<T> {
    protected _operators: Record<string, ProcessOperator<T>> = {};

    /**
     * Add a new operator (throw error if already defined)
     */
    add(key: string, operator: ProcessOperator<T>): ProcessOperators<T> {
        if (Object.keys(this._operators).includes(key))
            throw Error(`Operator [${key}] allready defined`);
        return this.set(key, operator);
    }

    /**
     * Add or sets a operator
     */
    set(key: string, operator: ProcessOperator<T>): ProcessOperators<T> {
        this._operators[key] = operator;
        return this;
    }

    /**
     * Get a operator, will return undefined on invalid key.
     */
    get(key: string): ProcessOperator<T> {
        return this._operators[key];
    }

    /**
     *  Process registered processors.
     */
    process(request: T): Observable<T> {
        return from(Object.values(this._operators)).pipe(
            mergeScan(
                // resolve current operator and return result or previous if void
                (value, operator) => Promise.resolve(operator(value)).then((x) => x ?? value),
                // initial value
                request,
                // only allow concurrency of one operator
                1
            ),
            // output result of last operator
            last()
        );
    }
}
