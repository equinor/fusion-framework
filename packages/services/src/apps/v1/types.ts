/**
 * Model types for Fusion Apps API version 1.0.
 *
 * Every type here is `z.infer` of the matching schema in `./schemas`. The direction of truth is Zod
 * → TypeScript: the schemas validate at runtime and the types are derived from them, because
 * TypeScript types are erased and cannot produce a validator. Nothing in this package declares an
 * API shape twice.
 *
 * The names carry the API version they describe, so `ApiAppV1` can never silently become the shape
 * of a future API version. An Apps API 2.0 would add `ApiAppV2` from a sibling `../v2` graph.
 *
 * This module is type-only, so re-exporting it costs nothing at runtime and pulls no schema module
 * into a consumer's bundle.
 *
 * @packageDocumentation
 */

export type { AccessRequirementV1 } from './schemas/access-requirement-schema-v1';
export type { AccountIdentifierV1 } from './schemas/account-identifier-schema-v1';
export type { ApiAccountV1 } from './schemas/api-account-schema-v1';
export type { ApiAppAdminV1 } from './schemas/api-app-admin-schema-v1';
export type { ApiAppCategoryV1 } from './schemas/api-app-category-schema-v1';
export type { ApiAppComplianceSummaryV1 } from './schemas/api-app-compliance-summary-schema-v1';
export type { ApiAppComplianceV1 } from './schemas/api-app-compliance-schema-v1';
export type { ApiAppContextV1 } from './schemas/api-app-context-schema-v1';
export type { ApiAppListItemV1 } from './schemas/api-app-list-item-schema-v1';
export type { ApiAppOwnerV1 } from './schemas/api-app-owner-schema-v1';
export type { ApiAppServiceNowConfigurationV1 } from './schemas/api-app-service-now-configuration-schema-v1';
export type { ApiAppTagHistoryV1 } from './schemas/api-app-tag-history-schema-v1';
export type { ApiAppTagV1 } from './schemas/api-app-tag-schema-v1';
export type { ApiAppV1 } from './schemas/api-app-schema-v1';
export type { ApiAppVersionConfigV1 } from './schemas/api-app-version-config-schema-v1';
export type { ApiAppVersionV1 } from './schemas/api-app-version-schema-v1';
export type { ApiAppVisualizationV1 } from './schemas/api-app-visualization-schema-v1';
export type { ApiBundleContentV1 } from './schemas/api-bundle-content-schema-v1';
export type { ApiBusinessOwnerOrgUnitV1 } from './schemas/api-business-owner-org-unit-schema-v1';
export type { ApiBusinessOwnerRoleV1 } from './schemas/api-business-owner-role-schema-v1';
export type { ApiBusinessOwnerV1 } from './schemas/api-business-owner-schema-v1';
export type { ApiChangelogV1 } from './schemas/api-changelog-schema-v1';
export type { ApiContextTypeV1 } from './schemas/api-context-type-schema-v1';
export type { ApiDataClassificationDefinitionV1 } from './schemas/api-data-classification-definition-schema-v1';
export type { ApiDataClassificationV1 } from './schemas/api-data-classification-schema-v1';
export type { ApiDocumentTypeV1 } from './schemas/api-document-type-schema-v1';
export type { ApiEndpointConfigV1 } from './schemas/api-endpoint-config-schema-v1';
export type { ApiGovernanceAppV1 } from './schemas/api-governance-app-schema-v1';
export type { ApiGovernanceConfirmationV1 } from './schemas/api-governance-confirmation-schema-v1';
export type { ApiGovernanceDocumentV1 } from './schemas/api-governance-document-schema-v1';
export type { ApiPagedCollectionV1 } from './schemas/api-paged-collection-schema-v1';
export type { ApiPersonAppListItemV1 } from './schemas/api-person-app-list-item-schema-v1';
export type { ApiPersonAppV1 } from './schemas/api-person-app-schema-v1';
export type { ApiPinnedAppCategoryV1 } from './schemas/api-pinned-app-category-schema-v1';
export type { ApiPinnedAppV1 } from './schemas/api-pinned-app-schema-v1';
export type { ApiProjectCategoryV1 } from './schemas/api-project-category-schema-v1';
export type { ApiProjectPhaseV1 } from './schemas/api-project-phase-schema-v1';
export type { ApiSubscriptionTypeV1 } from './schemas/api-subscription-type-schema-v1';
export type { ApiTagAppBuildV1 } from './schemas/api-tag-app-build-schema-v1';
export type { ApiTaggedPersonV1 } from './schemas/api-tagged-person-schema-v1';
export type { ApiTechnologyProductV1 } from './schemas/api-technology-product-schema-v1';
export type { ApiWidgetAdminV1 } from './schemas/api-widget-admin-schema-v1';
export type { ApiWidgetTagV1 } from './schemas/api-widget-tag-schema-v1';
export type { ApiWidgetV1 } from './schemas/api-widget-schema-v1';
export type { ApiWidgetVersionConfigV1 } from './schemas/api-widget-version-config-schema-v1';
export type { ApiWidgetVersionV1 } from './schemas/api-widget-version-schema-v1';
export type { AppCategoryIdentifierV1 } from './schemas/app-category-identifier-schema-v1';
export type { AppContextRequestV1 } from './schemas/app-context-request-schema-v1';
export type { AppFeatureEventsQueryRequestV1 } from './schemas/app-feature-events-query-request-schema-v1';
export type { AppGovernanceDocumentRequestV1 } from './schemas/app-governance-document-request-schema-v1';
export type { AppIdentifierV1 } from './schemas/app-identifier-schema-v1';
export type { AppVersionIdentifierV1 } from './schemas/app-version-identifier-schema-v1';
export type { AppVisualizationV1 } from './schemas/app-visualization-schema-v1';
export type { ConfirmGovernanceRequestV1 } from './schemas/confirm-governance-request-schema-v1';
export type { CreateAppBuildConfigRequestV1 } from './schemas/create-app-build-config-request-schema-v1';
export type { CreateAppCategoryRequestV1 } from './schemas/create-app-category-request-schema-v1';
export type { CreateAppRequestV1 } from './schemas/create-app-request-schema-v1';
export type { CreateAppTagRequestV1 } from './schemas/create-app-tag-request-schema-v1';
export type { CreateContextTypeRequestV1 } from './schemas/create-context-type-request-schema-v1';
export type { CreatePersonAppTagRequestV1 } from './schemas/create-person-app-tag-request-schema-v1';
export type { CreatePinnedAppRequestV1 } from './schemas/create-pinned-app-request-schema-v1';
export type { CreateTechnologyProductRequestV1 } from './schemas/create-technology-product-request-schema-v1';
export type { CreateWidgetBuildConfigRequestV1 } from './schemas/create-widget-build-config-request-schema-v1';
export type { CreateWidgetRequestV1 } from './schemas/create-widget-request-schema-v1';
export type { CreateWidgetTagRequestV1 } from './schemas/create-widget-tag-request-schema-v1';
export type { DataClassificationRequestV1 } from './schemas/data-classification-request-schema-v1';
export type { EndpointConfigRequestV1 } from './schemas/endpoint-config-request-schema-v1';
export type { ExpandV1 } from './schemas/expand-schema-v1';
export type { ExpressionTypeV1 } from './schemas/expression-type-schema-v1';
export type { FilterV1 } from './schemas/filter-schema-v1';
export type { ForbiddenItemV1 } from './schemas/forbidden-item-schema-v1';
export type { FusionForbiddenResponseV1 } from './schemas/fusion-forbidden-response-schema-v1';
export type { IdentifierTypeV1 } from './schemas/identifier-type-schema-v1';
export type { ODataExpandItemV1 } from './schemas/o-data-expand-item-schema-v1';
export type { ODataExpressionV1 } from './schemas/o-data-expression-schema-v1';
export type { ODataOrderByOptionV1 } from './schemas/o-data-order-by-option-schema-v1';
export type { ODataQueryParamsV1 } from './schemas/o-data-query-params-schema-v1';
export type { OrderByV1 } from './schemas/order-by-schema-v1';
export type { PatchAppRequestV1 } from './schemas/patch-app-request-schema-v1';
export type { PatchAppServiceNowConfigurationRequestV1 } from './schemas/patch-app-service-now-configuration-request-schema-v1';
export type { PatchAppVisualizationRequestV1 } from './schemas/patch-app-visualization-request-schema-v1';
export type { PatchCategoryRequestV1 } from './schemas/patch-category-request-schema-v1';
export type { PatchContextTypeRequestV1 } from './schemas/patch-context-type-request-schema-v1';
export type { PatchGovernanceAppRequestV1 } from './schemas/patch-governance-app-request-schema-v1';
export type { PatchGovernanceDocumentRequestV1 } from './schemas/patch-governance-document-request-schema-v1';
export type { PatchPropertyOfAccountIdentifierV1 } from './schemas/patch-property-of-account-identifier-schema-v1';
export type { PatchPropertyOfAppCategoryIdentifierV1 } from './schemas/patch-property-of-app-category-identifier-schema-v1';
export type { PatchPropertyOfBooleanV1 } from './schemas/patch-property-of-boolean-schema-v1';
export type { PatchPropertyOfDataClassificationRequestV1 } from './schemas/patch-property-of-data-classification-request-schema-v1';
export type { PatchPropertyOfListOfAccountIdentifierV1 } from './schemas/patch-property-of-list-of-account-identifier-schema-v1';
export type { PatchPropertyOfListOfAppContextRequestV1 } from './schemas/patch-property-of-list-of-app-context-request-schema-v1';
export type { PatchPropertyOfListOfStringV1 } from './schemas/patch-property-of-list-of-string-schema-v1';
export type { PatchPropertyOfListOfUpdateBusinessOwnerRequestV1 } from './schemas/patch-property-of-list-of-update-business-owner-request-schema-v1';
export type { PatchPropertyOfListOfUpdateProjectCategoryRequestV1 } from './schemas/patch-property-of-list-of-update-project-category-request-schema-v1';
export type { PatchPropertyOfListOfUpdateProjectPhaseRequestV1 } from './schemas/patch-property-of-list-of-update-project-phase-request-schema-v1';
export type { PatchPropertyOfPatchAppServiceNowConfigurationRequestV1 } from './schemas/patch-property-of-patch-app-service-now-configuration-request-schema-v1';
export type { PatchPropertyOfPatchAppVisualizationRequestV1 } from './schemas/patch-property-of-patch-app-visualization-request-schema-v1';
export type { PatchPropertyOfPropertiesCollectionV1 } from './schemas/patch-property-of-properties-collection-schema-v1';
export type { PatchPropertyOfShortV1 } from './schemas/patch-property-of-short-schema-v1';
export type { PatchPropertyOfStringV1 } from './schemas/patch-property-of-string-schema-v1';
export type { PatchPropertyOfTemplateSourceRequestV1 } from './schemas/patch-property-of-template-source-request-schema-v1';
export type { PatchPropertyOfUpdateBusinessOwnerOrgUnitRequestV1 } from './schemas/patch-property-of-update-business-owner-org-unit-request-schema-v1';
export type { PatchPropertyOfUpdateTechnologyProductForAppRequestV1 } from './schemas/patch-property-of-update-technology-product-for-app-request-schema-v1';
export type { PatchTechnologyProductRequestV1 } from './schemas/patch-technology-product-request-schema-v1';
export type { ProblemDetailsV1 } from './schemas/problem-details-schema-v1';
export type { SearchV1 } from './schemas/search-schema-v1';
export type { SkipV1 } from './schemas/skip-schema-v1';
export type { SortDirectionV1 } from './schemas/sort-direction-schema-v1';
export type { SubscriptionRequestV1V1 } from './schemas/subscription-request-v1-schema-v1';
export type { TechnologyProductIdentifierV1 } from './schemas/technology-product-identifier-schema-v1';
export type { TemplateSourceRequestV1 } from './schemas/template-source-request-schema-v1';
export type { TemplateV1 } from './schemas/template-schema-v1';
export type { TopV1 } from './schemas/top-schema-v1';
export type { UpdateBusinessOwnerOrgUnitRequestV1 } from './schemas/update-business-owner-org-unit-request-schema-v1';
export type { UpdateBusinessOwnerRequestV1 } from './schemas/update-business-owner-request-schema-v1';
export type { UpdateProjectCategoryRequestV1 } from './schemas/update-project-category-request-schema-v1';
export type { UpdateProjectPhaseRequestV1 } from './schemas/update-project-phase-request-schema-v1';
export type { UpdateTechnologyProductForAppRequestV1 } from './schemas/update-technology-product-for-app-request-schema-v1';
export type { ValidationProblemDetailsV1 } from './schemas/validation-problem-details-schema-v1';
