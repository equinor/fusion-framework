import { EMPTY } from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';

import { type ContextModule } from '../module';

export type ContextPathResolveArgs = {
    extract?: (path: string) => string | undefined;
    validate?: (contextId: string) => boolean;
};

const matchGUID =
    /^(?:(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12})$/;

const extractContextIdFromPath = (path: string): string | undefined =>
    path.replace(/^\/+/, '').split('/').shift();

const validateContextId = (contextId: string): boolean => !!contextId.match(matchGUID);

export const resolveContextFromPath =
    (context: ModuleType<ContextModule>, args?: ContextPathResolveArgs) => (path: string) => {
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

export default resolveContextFromPath;
