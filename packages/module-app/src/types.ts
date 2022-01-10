export enum ContextTypes {
    Contract = 'Contract',
    OrgChart = 'OrgChart',
    PDP = 'PDP',
    PimsDomain = 'PimsDomain',
    Portfolio = 'Portfolio',
    Project = 'Project',
    ProjectMaster = 'ProjectMaster',
    Facility = 'Facility',
    TpdPortfolio = 'TpdPortfolio',
}

export class ContextType {
    constructor(
        readonly id: ContextTypes,
        readonly isChildType: boolean,
        readonly parentTypeIds: string[] = []
    ) {}
}

type ParentContext = {
    id: string;
    type: ContextType;
};

export type Context = {
    id: string;
    externalId: string | null;
    type: ContextType;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    isActive: boolean;
    parent: ParentContext;
};

export type ContextManifest = {
    readonly types: ContextTypes[];
    readonly placeholder?: string;
    readonly nullable?: boolean;
    filterContexts?: (contexts: Context[]) => Context[];
    buildUrl?: (context: Context | null, url: string) => string;
    getContextFromUrl?: (url: string) => string;
};

export type AppType = 'standalone' | 'report' | 'launcher';

export type AppAuth = {
    clientId: string;
    resources: string[];
};

type AppCategory = {
    id?: string;
    name: string | null;
    color: string | null;
    defaultIcon: string | null;
};

export type AppManifest = {
    key: string;
    name: string;
    shortName: string;
    version: string;
    description: string;
    type: AppType;
    tags: string[];
    context?: ContextManifest;
    auth?: AppAuth[];
    icon?: string;
    order: number | null;
    publishedDate: Date | null;
    accentColor: string | null;
    categoryId: string | null;
    category: AppCategory | null;
    hide?: boolean;
};
