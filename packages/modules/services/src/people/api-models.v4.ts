import type {
  ApiAccountClassification,
  ApiInvitationStatus,
  ApiManager,
  ApiProfileAccountLink,
  ApiProfileAccountType,
  ApiProjectMaster,
} from './api-models';

/**
 * Map of expandable properties available on a v4 person entity.
 *
 * Use the `expand` parameter in API requests to include these
 * nested collections alongside the core person data.
 */
export type ApiPersonExpandMap_v4 = {
  roles: Array<ApiPersonRole_v4>;
  positions: Array<ApiPersonPosition_v4>;
  contracts: Array<ApiPersonContract_v4>;
  manager: ApiManager;
  companies: Array<ApiCompanyInfo_v4>;
};

/** Union of valid expand property keys for the v4 person entity. */
export type ApiPersonExpandProps_v4 = keyof ApiPersonExpandMap_v4;

/**
 * Person entity returned by the v4 people API.
 *
 * Includes only the expanded properties specified by `TExpand`.
 * Non-expanded properties from {@link ApiPersonExpandMap_v4} remain
 * `Partial` (i.e. `undefined` at runtime).
 *
 * @template TExpand - Array of expand property keys to include.
 */
export type ApiPerson_v4<TExpand extends Array<ApiPersonExpandProps_v4> = []> = {
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
} & /** expanded */ Partial<ApiPersonExpandMap_v4> & {
    /** Provided */
    [K in TExpand[number]]: ApiPersonExpandMap_v4[K];
  };

/** Company information associated with a v4 person entity. */
export type ApiCompanyInfo_v4 = {
  id: string;
  name?: string;
};

/** Role assigned to a person in the v4 API. */
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

/** Scope constraint on a person role. */
export type ApiPersonRoleScope_v4 = {
  type?: string;
  values?: string[];
  valueType?: string;
};

/** Position instance held by a person in the v4 API. */
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

/** Base position reference for a person position. */
export type ApiPersonBasePosition_v4 = {
  id: string;
  name?: string;
  type?: string;
  discipline?: string;
};

/** Project reference for a person position or contract. */
export type ApiPersonProject_v4 = {
  id: string;
  name?: string;
  domainId?: string;
  type?: string;
};

/** Contract associated with a person in the v4 API. */
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

/** @deprecated Use {@link ApiCompanyInfo_v4} instead. */
export type ApiCompanyInfoV4 = {
  id: string;
  name?: string;
};
