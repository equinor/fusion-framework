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
     * @param path - The path to extract the context id from.
     * @returns The context id or undefined if not found.
     */
    extract?: (path: string) => string | undefined;
    /**
     * Callback to validate a context id.
     * @param contextId - The context id to validate.
     * @returns True if the context id is valid, false otherwise.
     */
    validate?: (contextId: string) => boolean;
};

// GUID pattern
const matchGUID =
    /^(?:(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12})$/;

/**
 * Extracts a context id from a given path using a specified regular expression pattern.
 * By default, the function uses a GUID pattern to match context ids.
 * It removes leading slashes, splits the path by slashes, and returns the first path segment that matches the pattern.
 *
 * @example
 * ```ts
 * const path = '/apps/context/7fd97952-7fe6-409b-a6dc-292dbf0e50d7?dsadasdas#example';
 * const contextId = extractContextIdFromPath(path); // '7fd97952-7fe6-409b-a6dc-292dbf0e50d7'
 * ```
 *
 * @param path - The path to extract the context id from.
 * @param matcher - The regular expression pattern to match against.
 * @returns The extracted context id or undefined if no match is found.
 */
export const extractContextIdFromPath = (
    path: string,
    matcher: RegExp = matchGUID,
): string | undefined =>
    path
        .replace(/^\/+/, '') // remove leading slashes
        .split('/') // split path by slashes
        .find((x) => x.match(matcher)); // find the first segment that matches the pattern

/**
 * Validates whether a given context id matches the GUID pattern.
 *
 * @param contextId - The context id to validate.
 * @returns True if the context id matches the GUID pattern, false otherwise.
 */
export const validateContextId = (contextId: string): boolean => !!contextId.match(matchGUID);

/**
 * Creates a function that resolves a context item from a given path.
 * The function uses the provided context module to perform the resolution.
 * Custom extract and validate functions can be supplied to tailor the context id processing.
 * If the context id is not found or fails validation, an error is thrown.
 * If the context id is valid but cannot be resolved, an EMPTY observable is returned.
 * Otherwise, an Observable of the resolved context item is returned.
 *
 * @example
 * ```ts
 * const resolve = resolveContextFromPath(modules.context);
 * resolve(
 *  '/apps/context/7fd97952-7fe6-409b-a6dc-292dbf0e50d7?foobar#example'
 * ).subscribe({
 *   next: contextItem => console.log(contextItem),
 *   error: err => console.error(err),
 * });
 * ```
 *
 * @param context - The context module used to resolve the context.
 * @param args - Optional arguments for custom extraction and validation of the context id.
 * @returns A function that takes a path and returns an Observable of the resolved context item.
 */
export function resolveContextFromPath(
    context: ModuleType<ContextModule>,
    args?: ContextPathResolveArgs,
): (path: string) => Observable<ContextItem> {
    return (path) => {
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
