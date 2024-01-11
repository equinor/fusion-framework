// import type { ApiPerson_v4 } from '@equinor/fusion-framework-module-services/people/api-models.v4';
export type SheetContentProps = {
    readonly azureId?: string;
    readonly sheet?: string;
    navigate(sheet?: string): void;
};
