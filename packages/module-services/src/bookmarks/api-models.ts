export interface ApiBookmarkEntityV1<TPayload> {
    id: string;
    name: string;
    description: string;
    isShared: boolean;
    payload: TPayload;
    appKey: string;
    context: Context;
    createdBy: CreatedBy;
    updatedBy: UpdatedBy;
    created: Date;
    updated: Date;
    sourceSystem: SourceSystem;
}

export interface Context {
    id: string;
    name: string;
    type: string;
}

export interface CreatedBy {
    azureUniqueId: string;
    mail: string;
    name: string;
    phoneNumber: string;
    jobTitle: string;
    accountType: number;
    accountClassification: number;
}

export interface UpdatedBy {
    azureUniqueId: string;
    mail: string;
    name: string;
    phoneNumber: string;
    jobTitle: string;
    accountType: number;
    accountClassification: number;
}

export interface SourceSystem {
    identifier: string;
    name: string;
    subSystem: string;
}
