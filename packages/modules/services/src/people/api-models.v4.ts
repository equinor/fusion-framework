import {
    ApiAccountClassification,
    ApiInvitationStatus,
    ApiProfileAccountLink,
    ApiProfileAccountType,
    ApiProjectMaster,
} from './api-models';

export type ApiPerson_v4 = {
    azureUniqueId: string;
    mail?: string;
    name?: string;
    jobTitle?: string;
    department?: string;
    fullDepartment?: string;
    mobilePhone?: string;
    officeLocation?: string;
    upn?: string;
    isResourceOwner?: boolean;
    isExpired?: boolean;
    expiredDate?: string;
    isPrimaryAccount?: boolean;
    preferredContactMail?: string;
    accountType?: ApiProfileAccountType;

    // TODO is this default
    invitationStatus?: ApiInvitationStatus;
    accountClassification?: ApiAccountClassification;
    managerAzureUniqueId?: string;

    // TODO is this default
    linkedAccounts?: Array<ApiProfileAccountLink>;
};

export type ApiCompanyInfo_v4 = {
    id: string;
    name?: string;
};

export type ApiPersonRole_v4 = {
    name?: string;
    displayName?: string;
    sourceSystem?: string;
    type?: string;
    isActive?: boolean;
    activeToUtc?: string;
    onDemandSupport?: boolean;
    scopes?: Array<ApiPersonRoleScope_v4>;
};

export type ApiPersonRoleScope_v4 = {
    type?: string;
    values?: string[];
    valueType?: string;
};

export type ApiPersonPosition_v4 = {
    positionId: string;
    positionExternalId?: string;
    id: string;
    parentPositionId?: string;
    taskOwnerIds?: string[];
    name?: string;
    obs?: string;
    basePosition: ApiPersonBasePosition_v4;
    project: ApiPersonProject_v4;
    appliesFrom: string;
    appliesTo: string;
    workload?: number;
};

export type ApiPersonBasePosition_v4 = {
    id: string;
    name?: string;
    type?: string;
    discipline?: string;
};

export type ApiPersonProject_v4 = {
    id: string;
    name?: string;
    domainId?: string;
    type?: string;
};

export type ApiPersonContract_v4 = {
    id: string;
    name?: string;
    contractNumber?: string;
    companyId?: string;
    companyName?: string;
    project: ApiPersonProject_v4;
    projectMaster: ApiProjectMaster;
    positions: Array<ApiPersonPosition_v4>;
};

export type ApiCompanyInfoV4 = {
    id: string;
    name?: string;
};
