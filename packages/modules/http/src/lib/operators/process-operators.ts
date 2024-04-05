import { from, of } from 'rxjs';
import type { Observable } from 'rxjs';
import { last, mergeScan } from 'rxjs/operators';
import { IProcessOperators, ProcessOperator } from './types';

/**
 * ProcessOperators class manages a collection of process operators
 * and provides methods to add, set, get, and process these operators.
 */
export class ProcessOperators<T> implements IProcessOperators<T> {
    /**
     * A record of process operators keyed by a string.
     */
    protected _operators: Record<string, ProcessOperator<T>>;

    /**
     * Accessor for the operators.
     * @returns The record of process operators.
     */
    get operators(): Record<string, ProcessOperator<T>> {
        return this._operators;
    }

    /**
     * Constructs a new instance of the ProcessOperators class.
     * @param operators - An optional object containing process operators.
     *                    It can be either an instance of IProcessOperators<T> or a record of string keys and ProcessOperator<T> values.
     */
    constructor(operators?: IProcessOperators<T> | Record<string, ProcessOperator<T>>) {
        if (operators && 'operators' in operators) {
            this._operators = { ...operators.operators };
        } else {
            this._operators = operators ?? {};
        }
    }

    /**
     * Adds a new operator to the collection.
     * @param key The key under which the operator is stored.
     * @param operator The operator to be added.
     * @returns The instance of ProcessOperators for chaining.
     * @throws Error if an operator with the same key already exists.
     */
    add(key: string, operator: ProcessOperator<T>): ProcessOperators<T> {
        if (Object.keys(this._operators).includes(key))
            throw Error(`Operator [${key}] already defined`);
        return this.set(key, operator);
    }

    /**
     * Sets or updates an operator in the collection.
     * @param key The key under which the operator is stored.
     * @param operator The operator to be set.
     * @returns The instance of ProcessOperators for chaining.
     */
    set(key: string, operator: ProcessOperator<T>): ProcessOperators<T> {
        this._operators[key] = operator;
        return this;
    }

    /**
     * Retrieves an operator from the collection by its key.
     * @param key The key of the operator to retrieve.
     * @returns The retrieved operator.
     */
    get(key: string): ProcessOperator<T> {
        return this._operators[key];
    }

    /**
     * Processes an input request through the chain of operators.
     * @param request The request to be processed.
     * @returns An Observable of the processed request.
     */
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
                1,
            ),
            // output result of last operator
            last(),
        );
    }
}
