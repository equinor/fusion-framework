import { from, of } from 'rxjs';
import type { Observable } from 'rxjs';
import { last, mergeScan } from 'rxjs/operators';
import { IProcessOperators, ProcessOperator } from './types';

export class ProcessOperators<T> implements IProcessOperators<T> {
    protected _operators: Record<string, ProcessOperator<T>> = {};

    add(key: string, operator: ProcessOperator<T>): ProcessOperators<T> {
        if (Object.keys(this._operators).includes(key))
            throw Error(`Operator [${key}] already defined`);
        return this.set(key, operator);
    }

    set(key: string, operator: ProcessOperator<T>): ProcessOperators<T> {
        this._operators[key] = operator;
        return this;
    }

    get(key: string): ProcessOperator<T> {
        return this._operators[key];
    }

    process(request: T): Observable<T> {
        const operators = Object.values(this._operators);
        /** if no operators registered, just return the observable value */
        if (!operators.length) {
            return of(request);
        }
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
