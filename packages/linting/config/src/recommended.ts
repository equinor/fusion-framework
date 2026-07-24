import type { Rule } from '@equinor/fusion-framework-lint-core';
import {
  requireIntentCommentFlow,
  requireIntentCommentIterators,
  requireIntentCommentRxjs,
  requireIntentCommentBreakContinue,
  requireIntentCommentTypeAssertion,
  requireTsDoc,
  requireNodeProtocol,
  noClassComponents,
  noTodoWithoutIssue,
  noEmptyCatch,
  noSeparateExport,
  singleExportPerFile,
  requireComponentTsDoc,
  requireHookTsDoc,
} from '@equinor/fusion-framework-lint-rules';

export { recommendedConfig } from './recommended-config.js';

/**
 * Ordered list of rules included in the `recommended` preset.
 */
export const recommendedRules: Rule[] = [
  requireIntentCommentFlow,
  requireIntentCommentIterators,
  requireIntentCommentRxjs,
  requireIntentCommentBreakContinue,
  requireIntentCommentTypeAssertion,
  requireTsDoc,
  requireNodeProtocol,
  noClassComponents,
  noTodoWithoutIssue,
  noEmptyCatch,
  noSeparateExport,
  singleExportPerFile,
  requireComponentTsDoc,
  requireHookTsDoc,
];
