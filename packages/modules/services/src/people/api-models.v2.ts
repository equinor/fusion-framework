import type {
  ApiAccountClassification,
  ApiInvitationStatus,
  ApiProfileAccountLink,
  ApiProfileAccountType,
} from './api-models';

/** Person entity returned by the v2 people API. */
export type ApiPerson_v2 = {
  fusionPersonId?: string;
  azureUniqueId: string;
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
  accountType: ApiProfileAccountType;
  invitationStatus: ApiInvitationStatus;
  accountClassification: ApiAccountClassification;
  managerAzureUniqueId: string;
  linkedAccounts?: Array<ApiProfileAccountLink>;
  isPrimaryAccount?: boolean;
  preferredContactMail?: string;
};
