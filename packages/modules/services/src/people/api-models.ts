import { ApiVersion } from './static';

// TODO
type ApiPersonDetailEntity_vX = {
    azureId: string;
    name?: string;
    pictureSrc?: string;
    jobTitle?: string;
    department?: string;
    mail?: string;
    company?: string;
    mobilePhone?: string;
    // TODO
    accountType?: ApiPersonAccountType_vX;
    officeLocation?: string;
    // TODO
    positions?: ApiPersonPosition_vX[];
    // TODO
    manager?: ApiPersonManager_vX;
    managerAzureUniqueId?: string;
};

// TODO
enum ApiPersonAccountType_vX {
    Employee = 'Employee',
    Consultant = 'Consultant',
    Enterprise = 'Enterprise',
    External = 'External',
    ExternalHire = 'External Hire',
}

// TODO
type ApiPersonPosition_vX = {
    id: string;
    name: string;
    project: {
        id: string;
        name: string;
    };
};

// TODO
type ApiPersonManager_vX = {
    azureUniqueId: string;
    name?: string;
    pictureSrc?: string;
    department?: string;
    // TODO
    accountType?: ApiPersonAccountType_vX;
};

type ApiPersonDetailTypes = {
    // TODO
    [ApiVersion.v2]: ApiPersonDetailEntity_vX;
    // TODO
    [ApiVersion.v4]: ApiPersonDetailEntity_vX;
};

export type ApiPersonDetailType<T extends ApiVersion> = ApiPersonDetailTypes[T];
