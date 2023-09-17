import { ApiPerson } from './api-models';
import { ApiVersion } from './static';

// type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v2' | 'v4'>;

const requiredApiPersonAttributes = {
    [ApiVersion.v2]: [
        'azureUniqueId',
        'accountType',
        'invitationStatus',
        'accountClassification',
        'managerAzureUniqueId',
    ] satisfies Array<keyof ApiPerson<'v2'>>,
    [ApiVersion.v4]: [
        /** TODO - has to be more required attributes to identify V4??? */
        'azureUniqueId',
    ] satisfies Array<keyof ApiPerson<'v4'>>,
};

export const isApiPerson = <V extends keyof typeof ApiVersion>(version: V) => {
    /** todo add options for more strict check */
    return <T>(value: T): value is T extends ApiPerson<V> ? T : never => {
        /** early escape if value is not defined or not a object */
        if (!!value || typeof value !== 'object') {
            return false;
        }
        const attr = Object.keys(value as object);
        const requiredAttr = requiredApiPersonAttributes[ApiVersion[version]];
        const result = requiredAttr.every((key) => attr.includes(key));
        return result;
    };
};
