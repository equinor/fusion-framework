import { ApiVersion } from './static';

// TODO - some of these are nullable dunno which since all marked as nullable
type ApiPersonDetailEntity_vX = {
    azureUniqueId: string;
    fusionPersonId?: string;
    mail?: string;
    name?: string;
    jobTitle?: string;
    department?: string;
    fullDepartment?: string;
    mobilePhone?: string;
    officeLocation?: string;
    sapId?: string;
    employeeId?: string;
    isResourceOwner?: boolean;
    isExpired?: boolean;
    expiredDate?: string;
    upn?: string;
    managerAzureUniqueId?: string;
    isPrimaryAccount?: boolean;
    preferredContactMail?: string;

    // TODO - fix all
    accountType?: ApiPersonAccountType_vX;
    invitationStatus?: unknown;
    accountClassification?: unknown;
    linkedAccounts?: unknown;
};

// TODO - are there more?
type ApiPersonAccountType_vX =
    | 'Employee'
    | 'Consultant'
    | 'Enterprise'
    | 'External'
    | 'External Hire';

// TODO
// type ApiPersonPosition_vX = {
//     id: string;
//     name: string;
//     project: {
//         id: string;
//         name: string;
//     };
// };

// TODO
// type ApiPersonManager_vX = {
//     azureUniqueId: string;
//     name?: string;
//     pictureSrc?: string;
//     department?: string;
//     // TODO
//     accountType?: ApiPersonAccountType_vX;
// };

type ApiPersonDetailTypes = {
    // TODO
    [ApiVersion.v2]: ApiPersonDetailEntity_vX;
    // TODO
    [ApiVersion.v4]: ApiPersonDetailEntity_vX;
};

export type ApiPersonDetailType<T extends ApiVersion> = ApiPersonDetailTypes[T];
