import type { AppManifest, ApiApp, AppOwnerOrAdmin, AppBuild, AzureId } from './types';

// TODO: convert to zod parser
export class ApplicationManifest implements AppManifest {
    constructor(protected model: ApiApp) {}

    protected convertAzureId(user: AppOwnerOrAdmin) {
        const { azureUniqueId: azureId, ...rest } = user;
        return {
            azureId,
            ...rest,
        };
    }

    get admins() {
        return this.model.admins?.map(this.convertAzureId);
    }

    get owners() {
        return this.model.owners?.map(this.convertAzureId);
    }

    set key(appKey: string | null) {
        this.model.appKey = appKey;
    }

    get key() {
        return this.model.appKey;
    }

    get name() {
        return this.model.displayName;
    }

    get description() {
        return this.model.description;
    }

    get type() {
        return this.model.type;
    }

    get keywords() {
        return this.model.keywords;
    }

    get isPinned() {
        return this.model.isPinned;
    }

    get category() {
        return this.model.category;
    }

    /**
     * The published app build tagged `latest`
     */
    get build() {
        if (this.model.build?.uploadedBy) {
            // @ts-expect-error converting between types
            this.model.build.uploadedBy.azureId = this.model.build.uploadedBy.azureUniqueId;
        }
        return this.model.build as unknown as AppBuild<AzureId>;
    }

    get visualization() {
        return this.model.visualization;
    }

    /**
     * The app build version
     * @see {@link ApplicationManifest.build.version}
     * @deprecated use build.version instead
     * @since 5.3.6
     */
    get version() {
        return this.build.version;
    }

    /**
     * The app category id
     * @see {@link ApplicationManifest.category.id}
     * @deprecated use category.id instead
     * @since 5.3.6
     */
    get categoryId() {
        return this.category?.id;
    }

    /**
     * Deprecated
     * @deprecated No longer used in apps service
     * @since 5.3.6
     */
    get hide() {
        return undefined;
    }

    /**
     * The apps icon color
     * @see {@link ApplicationManifest.visualization.color}
     * @deprecated use visualization.color instead
     * @since 5.3.6
     */
    get accentColor() {
        return this.visualization.color;
    }

    /**
     * Deprecated, use name instead
     * @see {@link ApplicationManifest.visualization.icon}
     * @deprecated use visualization.icon instead
     * @since 5.3.6
     */
    get icon() {
        return this.visualization.icon;
    }

    /**
     * Gets the sort order for the app list.
     * @see {@link ApplicationManifest.visualization}
     * @deprecated use visualization.sortOrder
     * @since 5.3.6
     */
    get order() {
        return this.visualization.sortOrder;
    }

    /**
     * The apps name
     * @see {@link ApplicationManifest.name}
     * @deprecated use name instead
     * @since 5.3.6
     */
    get shortName() {
        return this.name;
    }

    /**
     * Authentication settings for the app.
     * Switch to using `apps/persons` endpoint to get app for specific persons.
     * @see {@link ApplicationManifest.owners}
     * @deprecated use owners or admins instead
     * @since 5.3.6
     */
    get auth() {
        return this.model.owners;
    }

    /**
     * Timestamp when build was published
     * @see {@link ApplicationManifest.build.timestamp}
     * @deprecated use build.timestamp instead
     * @since 5.3.6
     */
    get publishedDate() {
        return this.build?.timestamp;
    }

    /**
     * The entrypoint for the apps
     * @see {@link ApplicationManifest.build}
     * @deprecated use entryPoint from build
     * @since v5.3.6
     */
    get entry() {
        return this.build?.entryPoint;
    }

    /**
     * @see {@link ApplicationManifest.build}
     * @deprecated use tags from build
     * @since v5.3.6
     */
    get tags() {
        return this.build?.tags;
    }

    /**
     * @see {@link ApplicationManifest.build}
     * @deprecated use tags from build
     * @since v5.3.6
     */
    get tag() {
        return this.build?.tag;
    }
}
