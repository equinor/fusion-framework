/**
 * @packageDocumentation
 *
 * Fusion Apps endpoint functions and types.
 *
 * The Fusion Apps service manages the applications and widgets the Fusion portal serves: their
 * builds and bundles, tags, categories, context types, governance records, per-person settings
 * and pinned apps, changelog entries, and the technology-product libraries governance draws on.
 * Every operation the Apps OpenAPI document publishes is exported here as a standalone,
 * tree-shakeable function that takes an `IHttpClient` and issues exactly one HTTP request
 * against that service.
 *
 * Each endpoint is curried — bind the API version, HTTP client, and execution method once, then
 * call the returned function with the operation arguments. Every endpoint function carries the
 * OpenAPI summary of the operation it implements, so its hover documentation names the resource
 * and the HTTP verb.
 *
 * ## Finding the right function
 *
 * | Task | Functions |
 * | --- | --- |
 * | Read and register apps | `listApps`, `getApp`, `getAppAtVersion`, `createApp`, `updateApp`, `deleteApp`, `restoreApp`, `checkAppExists` |
 * | Publish and read app builds | `uploadAppBundle`, `listAppBuilds`, `getAppBuild`, `deleteAppBuild`, `getAppBuildConfig`, `upsertAppBuildConfig` |
 * | Serve bundle content | `getAppBundleArchive`, `getAppBundleResource`, `getAppBundleArchiveAtVersion`, `getAppBundleResourceAtVersion`, `getWidgetBundleResource` |
 * | Tag builds | `listAppTags`, `registerAppTag`, `deleteAppTag`, `listAppTagHistory`, `listTaggedAppBuilds`, `listAppTaggedPersons` |
 * | Categorise apps | `listAppCategories`, `getAppCategory`, `createAppCategory`, `updateAppCategory` |
 * | Govern apps | `getAppGovernance`, `updateAppGovernance`, `confirmAppGovernance`, `listAppGovernanceDocuments`, `getAppGovernanceDocument`, `createAppGovernanceDocument`, `updateAppGovernanceDocument`, `deleteAppGovernanceDocument`, `deleteAppGovernanceProperty`, `listAppCompliance` |
 * | Personal apps and settings | `listMyApps`, `getMyApp`, `getMyAppSettings`, `upsertMyAppSettings`, `setMyAppTag`, `deleteMyAppTag`, `listMyPinnedApps`, `pinMyApp`, `unpinMyApp` |
 * | Apps of another person | `listPersonApps`, `getPersonApp`, `getPersonAppSettings`, `upsertPersonAppSettings`, `setPersonAppTag`, `deletePersonAppTag`, `listPersonPinnedApps`, `pinPersonApp`, `unpinPersonApp`, `getPersonPinnedApp` |
 * | Widgets | `listWidgets`, `getWidget`, `createWidget`, `uploadWidgetBundle`, `listWidgetBuilds`, `getWidgetBuild`, `getWidgetBuildConfig`, `upsertWidgetBuildConfig`, `listWidgetTags`, `registerWidgetTag`, `deleteWidgetTag` |
 * | Context types and libraries | `listContextTypes`, `getContextType`, `createContextType`, `updateContextType`, `listBusinessOwnerRoles`, `listDataClassifications`, `listDocumentTypes`, `listTechnologyProducts`, `getTechnologyProduct`, `createTechnologyProduct`, `updateTechnologyProduct`, `deleteTechnologyProduct` |
 * | Changelog, events, and cache administration | `listChangelog`, `getChangelogEntry`, `listAppChangelog`, `listAppBuildChangelog`, `listAppCategoryChangelog`, `queryAppFeatureEvents`, `putAppsSubscription`, `listCachedApps`, `resetAppsCache`, `resetAppCategoriesCache`, `resetAllPersonAppsCache`, `resetPersonAppsCache` |
 *
 * The `check*Access` functions implement the `OPTIONS` operations the service publishes; they
 * answer `204 No Content` and publish their allowed-method information in response headers,
 * which this JSON client does not surface.
 *
 * ## Promises or observables
 *
 * The third argument selects how a request is consumed and defaults to `'json'`.
 * `'json'` resolves a `Promise`; `'json$'` returns an observable `StreamResponse`.
 * Both carry the same response type, so `GetAppResult<'v1'>` is `Promise<GetAppResponse<'v1'>>`
 * and `GetAppResult<'v1', 'json$'>` is `StreamResponse<GetAppResponse<'v1'>>`.
 *
 * ## Version-coupled endpoint typing
 *
 * Endpoints follow the Octokit model: the API version is the single discriminator for an
 * operation. Each endpoint declares one version contract — `{ [ApiVersion.v1]: { args, response } }`
 * — keyed by the *concrete* version, and the version a caller passes selects the request path,
 * the `api-version` query parameter, the argument schema, and the response schema from that one
 * entry. They can never disagree, and an unsupported version throws before the HTTP client is
 * touched.
 *
 * The coupling holds at compile time too: `GetAppArg<'v1'>` and `GetAppResponse<'v1'>` resolve
 * through the contract entry for the selected version rather than collapsing to a
 * version-neutral shape. `'v1'`, `'1.0'`, and `ApiVersion.v1` all name the same version, so all
 * three infer the same types; a future `'v2'` would infer different ones without unioning fields
 * across versions.
 *
 * Every operation exports four types beside its function: `<Operation>Version` (the identifiers
 * it accepts), `<Operation>Arg` (its arguments), `<Operation>Response` (its response body), and
 * `<Operation>Result` (what the selected client method hands back).
 *
 * Reusable schemas live in a version-scoped module graph (`v1/schemas`) and carry a matching
 * symbol suffix (`ApiAppSchemaV1`), so no schema can be reused for a version it was not written
 * for.
 *
 * ## Models are inferred, never declared twice
 *
 * The Zod schemas are the single source of truth. Every model type — `ApiAppV1`,
 * `CreateAppRequestV1`, and the rest — is `z.infer` of its schema, so the runtime validator and
 * the compile-time type can never disagree. The direction of truth is Zod → TypeScript and
 * cannot be reversed: TypeScript types are erased at runtime and cannot produce a validator.
 * Model names carry the API version, so `ApiAppV1` can never silently become a future version's
 * shape.
 *
 * ## The OpenAPI snapshot
 *
 * The complete published contract ships with the package and is importable for mocks, fixtures,
 * and code generation:
 * `import openapi from '@equinor/fusion-services/apps/v1/openapi.json' with { type: 'json' }`.
 * The subpath is versioned by the *API* version it describes. To check the snapshot against the
 * live service, run `pnpm --filter @equinor/fusion-services check:openapi apps`; it is read-only
 * and reports drift per operation and per component schema.
 *
 * Endpoints are reachable only through this service subpath (`@equinor/fusion-services/apps`) —
 * the package root exports no aggregated API, so a second service can never turn the root into a
 * namespace that drags every schema graph into a bundle.
 *
 * @example
 * ```ts
 * import { getApp } from '@equinor/fusion-services/apps';
 *
 * const app = await getApp('v1', httpClient)({ appIdentifier: 'my-app' });
 * ```
 *
 * @example
 * ```ts
 * import { listApps } from '@equinor/fusion-services/apps';
 *
 * listApps('v1', httpClient, 'json$')({ filter: "type eq 'standalone'" }).subscribe(console.log);
 * ```
 *
 * @example
 * Pin an app for the signed-in person, then read the pinned list back.
 * ```ts
 * import { pinMyApp, listMyPinnedApps } from '@equinor/fusion-services/apps';
 *
 * await pinMyApp('v1', httpClient)({ appKey: 'my-app' });
 * const pinned = await listMyPinnedApps('v1', httpClient)();
 * ```
 */

export { ApiVersion } from './static';

export type * from './types';

export type * from './v1/types';

export {
  type CheckAppAccessArg,
  type CheckAppAccessResponse,
  type CheckAppAccessResult,
  type CheckAppAccessVersion,
  checkAppAccess,
} from './endpoints/app.options';

export {
  type CheckAppBuildChangelogAccessArg,
  type CheckAppBuildChangelogAccessResponse,
  type CheckAppBuildChangelogAccessResult,
  type CheckAppBuildChangelogAccessVersion,
  checkAppBuildChangelogAccess,
} from './endpoints/app-build-changelog.options';

export {
  type CheckAppCategoriesAccessArg,
  type CheckAppCategoriesAccessResponse,
  type CheckAppCategoriesAccessResult,
  type CheckAppCategoriesAccessVersion,
  checkAppCategoriesAccess,
} from './endpoints/app-categories.options';

export {
  type CheckAppCategoryAccessArg,
  type CheckAppCategoryAccessResponse,
  type CheckAppCategoryAccessResult,
  type CheckAppCategoryAccessVersion,
  checkAppCategoryAccess,
} from './endpoints/app-category.options';

export {
  type CheckAppCategoryChangelogAccessArg,
  type CheckAppCategoryChangelogAccessResponse,
  type CheckAppCategoryChangelogAccessResult,
  type CheckAppCategoryChangelogAccessVersion,
  checkAppCategoryChangelogAccess,
} from './endpoints/app-category-changelog.options';

export {
  type CheckAppChangelogAccessArg,
  type CheckAppChangelogAccessResponse,
  type CheckAppChangelogAccessResult,
  type CheckAppChangelogAccessVersion,
  checkAppChangelogAccess,
} from './endpoints/app-changelog.options';

export {
  type CheckAppExistsArg,
  type CheckAppExistsResponse,
  type CheckAppExistsResult,
  type CheckAppExistsVersion,
  checkAppExists,
} from './endpoints/app.head';

export {
  type CheckAppGovernanceAccessArg,
  type CheckAppGovernanceAccessResponse,
  type CheckAppGovernanceAccessResult,
  type CheckAppGovernanceAccessVersion,
  checkAppGovernanceAccess,
} from './endpoints/app-governance.options';

export {
  type CheckAppGovernanceConfirmationAccessArg,
  type CheckAppGovernanceConfirmationAccessResponse,
  type CheckAppGovernanceConfirmationAccessResult,
  type CheckAppGovernanceConfirmationAccessVersion,
  checkAppGovernanceConfirmationAccess,
} from './endpoints/app-governance-confirmation.options';

export {
  type CheckAppGovernanceDocumentAccessArg,
  type CheckAppGovernanceDocumentAccessResponse,
  type CheckAppGovernanceDocumentAccessResult,
  type CheckAppGovernanceDocumentAccessVersion,
  checkAppGovernanceDocumentAccess,
} from './endpoints/app-governance-document.options';

export {
  type CheckAppGovernanceDocumentsAccessArg,
  type CheckAppGovernanceDocumentsAccessResponse,
  type CheckAppGovernanceDocumentsAccessResult,
  type CheckAppGovernanceDocumentsAccessVersion,
  checkAppGovernanceDocumentsAccess,
} from './endpoints/app-governance-documents.options';

export {
  type CheckAppsAccessArg,
  type CheckAppsAccessResponse,
  type CheckAppsAccessResult,
  type CheckAppsAccessVersion,
  checkAppsAccess,
} from './endpoints/apps.options';

export {
  type CheckContextTypesAccessArg,
  type CheckContextTypesAccessResponse,
  type CheckContextTypesAccessResult,
  type CheckContextTypesAccessVersion,
  checkContextTypesAccess,
} from './endpoints/context-types.options';

export {
  type CheckWidgetAccessArg,
  type CheckWidgetAccessResponse,
  type CheckWidgetAccessResult,
  type CheckWidgetAccessVersion,
  checkWidgetAccess,
} from './endpoints/widget.options';

export {
  type CheckWidgetsAccessArg,
  type CheckWidgetsAccessResponse,
  type CheckWidgetsAccessResult,
  type CheckWidgetsAccessVersion,
  checkWidgetsAccess,
} from './endpoints/widgets.options';

export {
  type ConfirmAppGovernanceArg,
  type ConfirmAppGovernanceResponse,
  type ConfirmAppGovernanceResult,
  type ConfirmAppGovernanceVersion,
  confirmAppGovernance,
} from './endpoints/app-governance-confirmation.put';

export {
  type CreateAppArg,
  type CreateAppResponse,
  type CreateAppResult,
  type CreateAppVersion,
  createApp,
} from './endpoints/apps.post';

export {
  type CreateAppCategoryArg,
  type CreateAppCategoryResponse,
  type CreateAppCategoryResult,
  type CreateAppCategoryVersion,
  createAppCategory,
} from './endpoints/app-categories.post';

export {
  type CreateAppGovernanceDocumentArg,
  type CreateAppGovernanceDocumentResponse,
  type CreateAppGovernanceDocumentResult,
  type CreateAppGovernanceDocumentVersion,
  createAppGovernanceDocument,
} from './endpoints/app-governance-documents.post';

export {
  type CreateContextTypeArg,
  type CreateContextTypeResponse,
  type CreateContextTypeResult,
  type CreateContextTypeVersion,
  createContextType,
} from './endpoints/context-types.post';

export {
  type CreateTechnologyProductArg,
  type CreateTechnologyProductResponse,
  type CreateTechnologyProductResult,
  type CreateTechnologyProductVersion,
  createTechnologyProduct,
} from './endpoints/technology-products.post';

export {
  type CreateWidgetArg,
  type CreateWidgetResponse,
  type CreateWidgetResult,
  type CreateWidgetVersion,
  createWidget,
} from './endpoints/widgets.post';

export {
  type DeleteAppArg,
  type DeleteAppResponse,
  type DeleteAppResult,
  type DeleteAppVersion,
  deleteApp,
} from './endpoints/app.delete';

export {
  type DeleteAppBuildArg,
  type DeleteAppBuildResponse,
  type DeleteAppBuildResult,
  type DeleteAppBuildVersion,
  deleteAppBuild,
} from './endpoints/app-build.delete';

export {
  type DeleteAppGovernanceDocumentArg,
  type DeleteAppGovernanceDocumentResponse,
  type DeleteAppGovernanceDocumentResult,
  type DeleteAppGovernanceDocumentVersion,
  deleteAppGovernanceDocument,
} from './endpoints/app-governance-document.delete';

export {
  type DeleteAppGovernancePropertyArg,
  type DeleteAppGovernancePropertyResponse,
  type DeleteAppGovernancePropertyResult,
  type DeleteAppGovernancePropertyVersion,
  deleteAppGovernanceProperty,
} from './endpoints/app-governance-property.delete';

export {
  type DeleteAppTagArg,
  type DeleteAppTagResponse,
  type DeleteAppTagResult,
  type DeleteAppTagVersion,
  deleteAppTag,
} from './endpoints/app-tag.delete';

export {
  type DeleteMyAppTagArg,
  type DeleteMyAppTagResponse,
  type DeleteMyAppTagResult,
  type DeleteMyAppTagVersion,
  deleteMyAppTag,
} from './endpoints/my-app-tag.delete';

export {
  type DeletePersonAppTagArg,
  type DeletePersonAppTagResponse,
  type DeletePersonAppTagResult,
  type DeletePersonAppTagVersion,
  deletePersonAppTag,
} from './endpoints/person-app-tag.delete';

export {
  type DeleteTechnologyProductArg,
  type DeleteTechnologyProductResponse,
  type DeleteTechnologyProductResult,
  type DeleteTechnologyProductVersion,
  deleteTechnologyProduct,
} from './endpoints/technology-product.delete';

export {
  type DeleteWidgetTagArg,
  type DeleteWidgetTagResponse,
  type DeleteWidgetTagResult,
  type DeleteWidgetTagVersion,
  deleteWidgetTag,
} from './endpoints/widget-tag.delete';

export {
  type GetAppArg,
  type GetAppResponse,
  type GetAppResult,
  type GetAppVersion,
  getApp,
} from './endpoints/app.get';

export {
  type GetAppAtVersionArg,
  type GetAppAtVersionResponse,
  type GetAppAtVersionResult,
  type GetAppAtVersionVersion,
  getAppAtVersion,
} from './endpoints/app-at-version.get';

export {
  type GetAppBuildArg,
  type GetAppBuildResponse,
  type GetAppBuildResult,
  type GetAppBuildVersion,
  getAppBuild,
} from './endpoints/app-build.get';

export {
  type GetAppBuildConfigArg,
  type GetAppBuildConfigResponse,
  type GetAppBuildConfigResult,
  type GetAppBuildConfigVersion,
  getAppBuildConfig,
} from './endpoints/app-build-config.get';

export {
  type GetAppBundleArchiveArg,
  type GetAppBundleArchiveResponse,
  type GetAppBundleArchiveResult,
  type GetAppBundleArchiveVersion,
  getAppBundleArchive,
} from './endpoints/app-bundle-archive.get';

export {
  type GetAppBundleArchiveAtVersionArg,
  type GetAppBundleArchiveAtVersionResponse,
  type GetAppBundleArchiveAtVersionResult,
  type GetAppBundleArchiveAtVersionVersion,
  getAppBundleArchiveAtVersion,
} from './endpoints/app-bundle-archive-at-version.get';

export {
  type GetAppBundleResourceArg,
  type GetAppBundleResourceResponse,
  type GetAppBundleResourceResult,
  type GetAppBundleResourceVersion,
  getAppBundleResource,
} from './endpoints/app-bundle-resource.get';

export {
  type GetAppBundleResourceAtVersionArg,
  type GetAppBundleResourceAtVersionResponse,
  type GetAppBundleResourceAtVersionResult,
  type GetAppBundleResourceAtVersionVersion,
  getAppBundleResourceAtVersion,
} from './endpoints/app-bundle-resource-at-version.get';

export {
  type GetAppCategoryArg,
  type GetAppCategoryResponse,
  type GetAppCategoryResult,
  type GetAppCategoryVersion,
  getAppCategory,
} from './endpoints/app-category.get';

export {
  type GetAppGovernanceArg,
  type GetAppGovernanceResponse,
  type GetAppGovernanceResult,
  type GetAppGovernanceVersion,
  getAppGovernance,
} from './endpoints/app-governance.get';

export {
  type GetAppGovernanceDocumentArg,
  type GetAppGovernanceDocumentResponse,
  type GetAppGovernanceDocumentResult,
  type GetAppGovernanceDocumentVersion,
  getAppGovernanceDocument,
} from './endpoints/app-governance-document.get';

export {
  type GetChangelogEntryArg,
  type GetChangelogEntryResponse,
  type GetChangelogEntryResult,
  type GetChangelogEntryVersion,
  getChangelogEntry,
} from './endpoints/changelog-entry.get';

export {
  type GetContextTypeArg,
  type GetContextTypeResponse,
  type GetContextTypeResult,
  type GetContextTypeVersion,
  getContextType,
} from './endpoints/context-type.get';

export {
  type GetMyAppArg,
  type GetMyAppResponse,
  type GetMyAppResult,
  type GetMyAppVersion,
  getMyApp,
} from './endpoints/my-app.get';

export {
  type GetMyAppSettingsArg,
  type GetMyAppSettingsResponse,
  type GetMyAppSettingsResult,
  type GetMyAppSettingsVersion,
  getMyAppSettings,
} from './endpoints/my-app-settings.get';

export {
  type GetMyPinnedAppArg,
  type GetMyPinnedAppResponse,
  type GetMyPinnedAppResult,
  type GetMyPinnedAppVersion,
  getMyPinnedApp,
} from './endpoints/my-pinned-app.get';

export {
  type GetPersonAppArg,
  type GetPersonAppResponse,
  type GetPersonAppResult,
  type GetPersonAppVersion,
  getPersonApp,
} from './endpoints/person-app.get';

export {
  type GetPersonAppSettingsArg,
  type GetPersonAppSettingsResponse,
  type GetPersonAppSettingsResult,
  type GetPersonAppSettingsVersion,
  getPersonAppSettings,
} from './endpoints/person-app-settings.get';

export {
  type GetPersonPinnedAppArg,
  type GetPersonPinnedAppResponse,
  type GetPersonPinnedAppResult,
  type GetPersonPinnedAppVersion,
  getPersonPinnedApp,
} from './endpoints/person-pinned-app.get';

export {
  type GetTechnologyProductArg,
  type GetTechnologyProductResponse,
  type GetTechnologyProductResult,
  type GetTechnologyProductVersion,
  getTechnologyProduct,
} from './endpoints/technology-product.get';

export {
  type GetWidgetArg,
  type GetWidgetResponse,
  type GetWidgetResult,
  type GetWidgetVersion,
  getWidget,
} from './endpoints/widget.get';

export {
  type GetWidgetBuildArg,
  type GetWidgetBuildResponse,
  type GetWidgetBuildResult,
  type GetWidgetBuildVersion,
  getWidgetBuild,
} from './endpoints/widget-build.get';

export {
  type GetWidgetBuildConfigArg,
  type GetWidgetBuildConfigResponse,
  type GetWidgetBuildConfigResult,
  type GetWidgetBuildConfigVersion,
  getWidgetBuildConfig,
} from './endpoints/widget-build-config.get';

export {
  type GetWidgetBundleResourceArg,
  type GetWidgetBundleResourceResponse,
  type GetWidgetBundleResourceResult,
  type GetWidgetBundleResourceVersion,
  getWidgetBundleResource,
} from './endpoints/widget-bundle-resource.get';

export {
  type ListAppBuildChangelogArg,
  type ListAppBuildChangelogResponse,
  type ListAppBuildChangelogResult,
  type ListAppBuildChangelogVersion,
  listAppBuildChangelog,
} from './endpoints/app-build-changelog.get';

export {
  type ListAppBuildsArg,
  type ListAppBuildsResponse,
  type ListAppBuildsResult,
  type ListAppBuildsVersion,
  listAppBuilds,
} from './endpoints/app-builds.get';

export {
  type ListAppCategoriesArg,
  type ListAppCategoriesResponse,
  type ListAppCategoriesResult,
  type ListAppCategoriesVersion,
  listAppCategories,
} from './endpoints/app-categories.get';

export {
  type ListAppCategoryChangelogArg,
  type ListAppCategoryChangelogResponse,
  type ListAppCategoryChangelogResult,
  type ListAppCategoryChangelogVersion,
  listAppCategoryChangelog,
} from './endpoints/app-category-changelog.get';

export {
  type ListAppChangelogArg,
  type ListAppChangelogResponse,
  type ListAppChangelogResult,
  type ListAppChangelogVersion,
  listAppChangelog,
} from './endpoints/app-changelog.get';

export {
  type ListAppComplianceArg,
  type ListAppComplianceResponse,
  type ListAppComplianceResult,
  type ListAppComplianceVersion,
  listAppCompliance,
} from './endpoints/app-compliance.get';

export {
  type ListAppGovernanceDocumentsArg,
  type ListAppGovernanceDocumentsResponse,
  type ListAppGovernanceDocumentsResult,
  type ListAppGovernanceDocumentsVersion,
  listAppGovernanceDocuments,
} from './endpoints/app-governance-documents.get';

export {
  type ListAppTagHistoryArg,
  type ListAppTagHistoryResponse,
  type ListAppTagHistoryResult,
  type ListAppTagHistoryVersion,
  listAppTagHistory,
} from './endpoints/app-tag-history.get';

export {
  type ListAppTaggedPersonsArg,
  type ListAppTaggedPersonsResponse,
  type ListAppTaggedPersonsResult,
  type ListAppTaggedPersonsVersion,
  listAppTaggedPersons,
} from './endpoints/app-tagged-persons.get';

export {
  type ListAppTagsArg,
  type ListAppTagsResponse,
  type ListAppTagsResult,
  type ListAppTagsVersion,
  listAppTags,
} from './endpoints/app-tags.get';

export {
  type ListAppsArg,
  type ListAppsResponse,
  type ListAppsResult,
  type ListAppsVersion,
  listApps,
} from './endpoints/apps.get';

export {
  type ListBusinessOwnerRolesArg,
  type ListBusinessOwnerRolesResponse,
  type ListBusinessOwnerRolesResult,
  type ListBusinessOwnerRolesVersion,
  listBusinessOwnerRoles,
} from './endpoints/business-owner-roles.get';

export {
  type ListCachedAppsArg,
  type ListCachedAppsResponse,
  type ListCachedAppsResult,
  type ListCachedAppsVersion,
  listCachedApps,
} from './endpoints/admin-cached-apps.get';

export {
  type ListChangelogArg,
  type ListChangelogResponse,
  type ListChangelogResult,
  type ListChangelogVersion,
  listChangelog,
} from './endpoints/changelog.get';

export {
  type ListContextTypesArg,
  type ListContextTypesResponse,
  type ListContextTypesResult,
  type ListContextTypesVersion,
  listContextTypes,
} from './endpoints/context-types.get';

export {
  type ListDataClassificationsArg,
  type ListDataClassificationsResponse,
  type ListDataClassificationsResult,
  type ListDataClassificationsVersion,
  listDataClassifications,
} from './endpoints/data-classifications.get';

export {
  type ListDocumentTypesArg,
  type ListDocumentTypesResponse,
  type ListDocumentTypesResult,
  type ListDocumentTypesVersion,
  listDocumentTypes,
} from './endpoints/document-types.get';

export {
  type ListMyAppsArg,
  type ListMyAppsResponse,
  type ListMyAppsResult,
  type ListMyAppsVersion,
  listMyApps,
} from './endpoints/my-apps.get';

export {
  type ListMyPinnedAppsArg,
  type ListMyPinnedAppsResponse,
  type ListMyPinnedAppsResult,
  type ListMyPinnedAppsVersion,
  listMyPinnedApps,
} from './endpoints/my-pinned-apps.get';

export {
  type ListPersonAppsArg,
  type ListPersonAppsResponse,
  type ListPersonAppsResult,
  type ListPersonAppsVersion,
  listPersonApps,
} from './endpoints/person-apps.get';

export {
  type ListPersonPinnedAppsArg,
  type ListPersonPinnedAppsResponse,
  type ListPersonPinnedAppsResult,
  type ListPersonPinnedAppsVersion,
  listPersonPinnedApps,
} from './endpoints/person-pinned-apps.get';

export {
  type ListTaggedAppBuildsArg,
  type ListTaggedAppBuildsResponse,
  type ListTaggedAppBuildsResult,
  type ListTaggedAppBuildsVersion,
  listTaggedAppBuilds,
} from './endpoints/tagged-app-builds.get';

export {
  type ListTechnologyProductsArg,
  type ListTechnologyProductsResponse,
  type ListTechnologyProductsResult,
  type ListTechnologyProductsVersion,
  listTechnologyProducts,
} from './endpoints/technology-products.get';

export {
  type ListWidgetBuildsArg,
  type ListWidgetBuildsResponse,
  type ListWidgetBuildsResult,
  type ListWidgetBuildsVersion,
  listWidgetBuilds,
} from './endpoints/widget-builds.get';

export {
  type ListWidgetTagsArg,
  type ListWidgetTagsResponse,
  type ListWidgetTagsResult,
  type ListWidgetTagsVersion,
  listWidgetTags,
} from './endpoints/widget-tags.get';

export {
  type ListWidgetsArg,
  type ListWidgetsResponse,
  type ListWidgetsResult,
  type ListWidgetsVersion,
  listWidgets,
} from './endpoints/widgets.get';

export {
  type PinMyAppArg,
  type PinMyAppResponse,
  type PinMyAppResult,
  type PinMyAppVersion,
  pinMyApp,
} from './endpoints/my-pinned-apps.post';

export {
  type PinPersonAppArg,
  type PinPersonAppResponse,
  type PinPersonAppResult,
  type PinPersonAppVersion,
  pinPersonApp,
} from './endpoints/person-pinned-apps.post';

export {
  type PutAppsSubscriptionArg,
  type PutAppsSubscriptionResponse,
  type PutAppsSubscriptionResult,
  type PutAppsSubscriptionVersion,
  putAppsSubscription,
} from './endpoints/apps-subscription.put';

export {
  type QueryAppFeatureEventsArg,
  type QueryAppFeatureEventsResponse,
  type QueryAppFeatureEventsResult,
  type QueryAppFeatureEventsVersion,
  queryAppFeatureEvents,
} from './endpoints/app-feature-events-query.post';

export {
  type RegisterAppTagArg,
  type RegisterAppTagResponse,
  type RegisterAppTagResult,
  type RegisterAppTagVersion,
  registerAppTag,
} from './endpoints/app-tag.put';

export {
  type RegisterWidgetTagArg,
  type RegisterWidgetTagResponse,
  type RegisterWidgetTagResult,
  type RegisterWidgetTagVersion,
  registerWidgetTag,
} from './endpoints/widget-tag.put';

export {
  type ResetAllPersonAppsCacheArg,
  type ResetAllPersonAppsCacheResponse,
  type ResetAllPersonAppsCacheResult,
  type ResetAllPersonAppsCacheVersion,
  resetAllPersonAppsCache,
} from './endpoints/admin-persons-apps-cache-reset.post';

export {
  type ResetAppCategoriesCacheArg,
  type ResetAppCategoriesCacheResponse,
  type ResetAppCategoriesCacheResult,
  type ResetAppCategoriesCacheVersion,
  resetAppCategoriesCache,
} from './endpoints/admin-app-categories-cache-reset.post';

export {
  type ResetAppsCacheArg,
  type ResetAppsCacheResponse,
  type ResetAppsCacheResult,
  type ResetAppsCacheVersion,
  resetAppsCache,
} from './endpoints/admin-apps-cache-reset.post';

export {
  type ResetPersonAppsCacheArg,
  type ResetPersonAppsCacheResponse,
  type ResetPersonAppsCacheResult,
  type ResetPersonAppsCacheVersion,
  resetPersonAppsCache,
} from './endpoints/admin-person-apps-cache-reset.post';

export {
  type RestoreAppArg,
  type RestoreAppResponse,
  type RestoreAppResult,
  type RestoreAppVersion,
  restoreApp,
} from './endpoints/app-restore.post';

export {
  type SetMyAppTagArg,
  type SetMyAppTagResponse,
  type SetMyAppTagResult,
  type SetMyAppTagVersion,
  setMyAppTag,
} from './endpoints/my-app-tag.put';

export {
  type SetPersonAppTagArg,
  type SetPersonAppTagResponse,
  type SetPersonAppTagResult,
  type SetPersonAppTagVersion,
  setPersonAppTag,
} from './endpoints/person-app-tag.put';

export {
  type UnpinMyAppArg,
  type UnpinMyAppResponse,
  type UnpinMyAppResult,
  type UnpinMyAppVersion,
  unpinMyApp,
} from './endpoints/my-pinned-app.delete';

export {
  type UnpinPersonAppArg,
  type UnpinPersonAppResponse,
  type UnpinPersonAppResult,
  type UnpinPersonAppVersion,
  unpinPersonApp,
} from './endpoints/person-pinned-app.delete';

export {
  type UpdateAppArg,
  type UpdateAppResponse,
  type UpdateAppResult,
  type UpdateAppVersion,
  updateApp,
} from './endpoints/app.patch';

export {
  type UpdateAppCategoryArg,
  type UpdateAppCategoryResponse,
  type UpdateAppCategoryResult,
  type UpdateAppCategoryVersion,
  updateAppCategory,
} from './endpoints/app-category.patch';

export {
  type UpdateAppGovernanceArg,
  type UpdateAppGovernanceResponse,
  type UpdateAppGovernanceResult,
  type UpdateAppGovernanceVersion,
  updateAppGovernance,
} from './endpoints/app-governance.patch';

export {
  type UpdateAppGovernanceDocumentArg,
  type UpdateAppGovernanceDocumentResponse,
  type UpdateAppGovernanceDocumentResult,
  type UpdateAppGovernanceDocumentVersion,
  updateAppGovernanceDocument,
} from './endpoints/app-governance-document.patch';

export {
  type UpdateContextTypeArg,
  type UpdateContextTypeResponse,
  type UpdateContextTypeResult,
  type UpdateContextTypeVersion,
  updateContextType,
} from './endpoints/context-type.patch';

export {
  type UpdateTechnologyProductArg,
  type UpdateTechnologyProductResponse,
  type UpdateTechnologyProductResult,
  type UpdateTechnologyProductVersion,
  updateTechnologyProduct,
} from './endpoints/technology-product.patch';

export {
  type UploadAppBundleArg,
  type UploadAppBundleResponse,
  type UploadAppBundleResult,
  type UploadAppBundleVersion,
  uploadAppBundle,
} from './endpoints/app-bundle.post';

export {
  type UploadWidgetBundleArg,
  type UploadWidgetBundleResponse,
  type UploadWidgetBundleResult,
  type UploadWidgetBundleVersion,
  uploadWidgetBundle,
} from './endpoints/widget-bundle.post';

export {
  type UpsertAppBuildConfigArg,
  type UpsertAppBuildConfigResponse,
  type UpsertAppBuildConfigResult,
  type UpsertAppBuildConfigVersion,
  upsertAppBuildConfig,
} from './endpoints/app-build-config.put';

export {
  type UpsertMyAppSettingsArg,
  type UpsertMyAppSettingsResponse,
  type UpsertMyAppSettingsResult,
  type UpsertMyAppSettingsVersion,
  upsertMyAppSettings,
} from './endpoints/my-app-settings.put';

export {
  type UpsertPersonAppSettingsArg,
  type UpsertPersonAppSettingsResponse,
  type UpsertPersonAppSettingsResult,
  type UpsertPersonAppSettingsVersion,
  upsertPersonAppSettings,
} from './endpoints/person-app-settings.put';

export {
  type UpsertWidgetBuildConfigArg,
  type UpsertWidgetBuildConfigResponse,
  type UpsertWidgetBuildConfigResult,
  type UpsertWidgetBuildConfigVersion,
  upsertWidgetBuildConfig,
} from './endpoints/widget-build-config.put';
