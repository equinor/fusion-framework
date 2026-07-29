import { EMPTY, type Observable } from 'rxjs';

import type { ModuleType } from '@equinor/fusion-framework-module';

import type { ContextModule } from '../module';
import type { ContextItem } from '../types';
import { extractContextIdFromPath } from './extract-context-id-from-path';

export { extractContextIdFromPath } from './extract-context-id-from-path';

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

// GUID pattern, used as the default context id validator
const matchGUID =
  /^(?:(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12})$/;

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
export function resolveContextFromPath(
  context: ModuleType<ContextModule>,
): (path: string) => Observable<ContextItem>;

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
export function resolveContextFromPath(
  context: ModuleType<ContextModule>,
  args?: ContextPathResolveArgs,
): (path: string) => Observable<ContextItem>;

/**
 * Resolves a context item from a path, using the provided extract/validate callbacks or the defaults.
 * @param context The context module.
 * @param args The arguments for resolving the path.
 * @returns A function that takes a path and returns an Observable of the resolved context item.
 * @throws Error if the extracted context id fails validation.
 */
export function resolveContextFromPath(
  context: ModuleType<ContextModule>,
  args?: ContextPathResolveArgs,
) {
  return (path: string) => {
    const { extract = extractContextIdFromPath, validate = validateContextId } = args ?? {};
    const contextId = extract(path);
    // no context id found in the path, nothing to resolve
    if (!contextId) {
      return EMPTY;
    }
    // only resolve the context if the extracted id passes validation
    if (validate(contextId)) {
      return context.contextClient.resolveContext(contextId);
    }

    throw Error(`Failed to validate context [${contextId}] from path [${path}]`);
  };
}

export default resolveContextFromPath;
