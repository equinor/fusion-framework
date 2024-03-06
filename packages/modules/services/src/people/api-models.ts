import { ApiPerson_v2 } from './api-models.v2';
import { ApiPerson_v4 } from './api-models.v4';
import { ApiVersion } from './static';

export type ApiProjectMaster = {
    id: string;
    name?: string;
};

export type ApiManager = {
    azureUniqueId: string;
    name?: string;
    mail?: string;
    department?: string;
    fullDepartment?: string;
    upn?: string;
    jobTitle?: string;
    accountType: ApiProfileAccountType;
    accountClassification: ApiAccountClassification;
};

export type ApiInvitationStatus = 'Accepted' | 'Pending' | 'NotSent';

export type ApiProfileAccountType =
    | 'Employee'
    | 'Consultant'
    | 'Enterprise'
    | 'External'
    | 'External Hire';

// TODO what are these?
export type ApiAccountClassification = 'Unclassified' | 'Internal' | 'External';

export type ApiProfileAccountLink = {
    azureUniqueId: string;
    mail?: string;
    isPrimaryAccount?: boolean;
    preferredContactMail?: string;
    isExpired?: boolean;
    upn?: string;
};

export type ApiPersonMap = {
    [ApiVersion.v2]: ApiPerson_v2;
    [ApiVersion.v4]: ApiPerson_v4;
};

export type ApiPerson<T extends keyof typeof ApiVersion | ApiVersion> = T extends ApiVersion
    ? ApiPersonMap[T]
    : T extends keyof typeof ApiVersion
      ? ApiPersonMap[(typeof ApiVersion)[T]]
      : unknown;
