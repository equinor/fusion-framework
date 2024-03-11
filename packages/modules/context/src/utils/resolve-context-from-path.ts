import { EMPTY, Observable } from 'rxjs';

import { type ModuleType } from '@equinor/fusion-framework-module';

import { type ContextModule } from '../module';
import { type ContextItem } from '../types';

/**
 * Arguments for resolving a context from a path.
 */
export type ContextPathResolveArgs = {
    /**
     * Callback to extract a context id from a path.
     * @param path string - the path to extract the context id from
     * @returns string | undefined - the context id or undefined
     */
    extract?: (path: string) => string | undefined;
    /**
     * Callback to validate a context id.
     * @param contextId string - the context id to validate
     * @returns boolean - true if the context id is valid
     */
    validate?: (contextId: string) => boolean;
};

// GUID pattern
const matchGUID =
    /^(?:(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12})$/;

/**
 * Method will try to extract a context id from a path.
 * The default matcher is a GUID pattern.
 * Will iterate over the path and return the first match.
 *
 * @example
 * ```ts
 * const path = '/apps/context/7fd97952-7fe6-409b-a6dc-292dbf0e50d7?dsadasdas#example';
 * const contextId = extractContextIdFromPath(path); // '7fd97952-7fe6-409b-a6dc-292dbf0e50d7'
 * ```
 *
 * @param path string - the path to extract the context id from
 * @param matcher RegExp - the pattern to match against
 * @returns string | undefined - the context id or undefined
 */
export const extractContextIdFromPath = (
    path: string,
    matcher: RegExp = matchGUID,
): string | undefined =>
    path
        // remove leading slashes
        .replace(/^\/+/, '')
        // split path by slashes
        .split('/')
        // find the first path fragment that matches the matcher
        .find((x) => x.match(matcher));

const validateContextId = (contextId: string): boolean => !!contextId.match(matchGUID);

/**
 * Method will try to resolve a context from a path.
 * The method will return a function that takes a path and returns an observable of the resolved context.
 * The method will use the context module to resolve the context.
 * The method will use the extract and validate methods from the args to extract and validate the context id.
 * If the context id is not valid, the method will throw an error.
 * If the context id is valid, the method will return an observable of the resolved context.
 * If the context id is not found, the method will return an empty observable.
 *
 * @example
 * ```ts
 * const resolve = resolveContextFromPath(modules.context);
 * resolve(
 *  '/apps/context/7fd97952-7fe6-409b-a6dc-292dbf0e50d7?foobar#example'
 * ).subscribe(console.log);
 * ```
 *
 * @param context The context module.
 * @returns A function that takes a path and returns an Observable of the resolved context item.
 */
export interface resolveContextFromPath {
    (context: ModuleType<ContextModule>): (path: string) => Observable<ContextItem>;
}

/**
 *
 * @example
 * ```ts
 * const resolve = resolveContextFromPath(
 *      modules.context,
 *       {
 *          extract: (path) => path.find(extractingContextFromPath),
 *          validate: (id) => isValidContextId(id)
 * });
 * resolve(
 *      '/apps/context/7fd97952-7fe6-409b-a6dc-292dbf0e50d7?foobar#example'
 * ).subscribe(console.log);
 * ```
 *
 * @param context The context module.
 * @param args The arguments for resolving the path.
 * @returns A function that takes a path and returns an Observable of the resolved context item.
 */
export interface resolveContextFromPath {
    (
        context: ModuleType<ContextModule>,
        args: ContextPathResolveArgs,
    ): (path: string) => Observable<ContextItem>;
}

export function resolveContextFromPath(
    context: ModuleType<ContextModule>,
    args?: ContextPathResolveArgs,
) {
    return (path: string) => {
        const { extract = extractContextIdFromPath, validate = validateContextId } = args ?? {};
        const contextId = extract(path);
        if (!contextId) {
            return EMPTY;
        }
        if (validate(contextId)) {
            return context.contextClient.resolveContext(contextId);
        }

        throw Error(`Failed to validate context [${contextId}] from path [${path}]`);
    };
}

export default resolveContextFromPath;
