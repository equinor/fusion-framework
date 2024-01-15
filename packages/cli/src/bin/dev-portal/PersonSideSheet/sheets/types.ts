export type SheetContentProps = {
    readonly azureId?: string;
    readonly sheet?: string;
    navigate(sheet?: string): void;
};
