import type { Rule } from '@equinor/fusion-framework-lint-core';
import {
  requireIntentCommentFlow,
  requireIntentCommentIterators,
  requireIntentCommentRxjs,
  requireIntentCommentBreakContinue,
  requireIntentCommentTypeAssertion,
  requireIntentCommentObjectMerge,
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
 * Each rule module exports a factory (`RuleDef`) \u2014 called here with no options
 * to build the default-configured `Rule` instance.
 */
export const recommendedRules: Rule[] = [
  requireIntentCommentFlow(),
  requireIntentCommentIterators(),
  requireIntentCommentRxjs(),
  requireIntentCommentBreakContinue(),
  requireIntentCommentTypeAssertion(),
  requireIntentCommentObjectMerge(),
  requireTsDoc(),
  requireNodeProtocol(),
  noClassComponents(),
  noTodoWithoutIssue(),
  noEmptyCatch(),
  noSeparateExport(),
  singleExportPerFile(),
  requireComponentTsDoc(),
  requireHookTsDoc(),
];
