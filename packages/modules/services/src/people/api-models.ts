import type { ApiPerson_v2 } from './api-models.v2';
import type { ApiPerson_v4 } from './api-models.v4';
import { ApiVersion } from './static';

/** Project master reference attached to a person's contract. */
export type ApiProjectMaster = {
  id: string;
  name?: string;
};

/** Manager information with contact details and classification. */
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

/** Invitation status for a person's account. */
export type ApiInvitationStatus = 'Accepted' | 'Pending' | 'NotSent';

/** Account type classification for a person profile. */
export type ApiProfileAccountType =
  | 'Employee'
  | 'Consultant'
  | 'Enterprise'
  | 'External'
  | 'External Hire';

/** Account classification tier for access control. */
export type ApiAccountClassification = 'Unclassified' | 'Internal' | 'External';

/** Linked account reference for a person profile. */
export type ApiProfileAccountLink = {
  azureUniqueId: string;
  mail?: string;
  isPrimaryAccount?: boolean;
  preferredContactMail?: string;
  isExpired?: boolean;
  upn?: string;
};

/**
 * Map from API version to the corresponding person entity type.
 *
 * @see {@link ApiPerson_v2}
 * @see {@link ApiPerson_v4}
 */
export type ApiPersonMap = {
  [ApiVersion.v2]: ApiPerson_v2;
  [ApiVersion.v4]: ApiPerson_v4;
};

/**
 * Version-aware person entity type.
 *
 * Resolves to the concrete person shape for a given {@link ApiVersion}
 * key or value.
 *
 * @template T - An `ApiVersion` key or value.
 */
export type ApiPerson<T extends keyof typeof ApiVersion | ApiVersion> = T extends ApiVersion
  ? ApiPersonMap[T]
  : T extends keyof typeof ApiVersion
    ? ApiPersonMap[(typeof ApiVersion)[T]]
    : unknown;

/** Person suggestion result with account type and department detail. */
export type ApiSuggestionPerson = {
  accountType?:
    | 'Unknown'
    | 'Employee'
    | 'Consultant'
    | 'Enterprise'
    | 'EnterpriseExternal'
    | 'External'
    | 'Local'
    | 'TemporaryEmployee'
    | 'System'
    | 'Admin'
    | 'MeetingRoom';
  jobTitle?: string;
  department?: string;
  fullDepartment?: string;
  employeeNumber?: string;
  managerAzureUniqueId?: string;
  upn?: string;
  mobilePhone?: string;
};

/** Application entity in a person suggestion result. */
export type ApiSuggestionApplication = {
  applicationId: string;
  applicationName?: string;
  servicePrincipalType: 'Application' | 'ManagedIdentity' | 'ServicePrincipal';
};

/** Single suggestion value representing a person or system account. */
export type ApiSuggestionValue = {
  azureUniqueId: string;
  name?: string;
  accountType: 'Person' | 'SystemAccount' | 'Unknown';
  accountLabel: string;
  person?: ApiSuggestionPerson;
  application?: ApiSuggestionApplication;
  avatarColor: string;
  avatarUrl: string;
  isExpired: boolean;
};

/** Paginated suggestion response from the people suggest endpoint. */
export type ApiSuggestions = {
  totalCount: number;
  count: number;
  '@nextPage': string | null;
  value: Array<ApiSuggestionValue>;
};

/** Single resolved item from the people resolve endpoint. */
export type ApiResolveItem = {
  success: boolean;
  statusCode: number;
  errorMessage: string | null;
  identifier: string;
  account: ApiSuggestionValue | null;
};

/** Array of resolved person lookup results. */
export type ApiResolved = Array<ApiResolveItem>;
