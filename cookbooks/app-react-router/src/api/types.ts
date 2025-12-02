/**
 * Person search result from the People API
 */
export type PersonSearchResult = {
  azureUniqueId?: string;
  mail?: string;
  name?: string;
  jobTitle?: string;
  department?: string;
  fullDepartment?: string;
  mobilePhone?: string;
  officeLocation?: string;
  upn?: string;
  accountType?: string;
  isResourceOwner: boolean;
};

/**
 * Person details from the People API
 */
export type PersonDetails = {
  azureId: string;
  name: string;
  jobTitle: string;
  department: string;
  mobilePhone: string;
  accountType: string;
};
