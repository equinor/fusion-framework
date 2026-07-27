import {
  type SourceFile as ProjectSourceFile,
  SyntaxKind,
  Node,
  type VariableStatement,
  type ClassDeclaration,
} from 'ts-morph';

import type { TypescriptDocument, ParseTsDocOptions } from './types.js';
import { nodeKinds } from './constants.js';
import { createTypescriptDocument } from './create-typescript-document.js';
import { extractDocumentFromClassNode } from './extract-document-from-class-node.js';

/**
 * Extracts a vector-store document from a single TypeScript AST node.
 *
 * Handles function declarations, variable statements (arrow / function
 * expressions), interfaces, type aliases, enums, and classes. Delegates
 * to {@link extractDocumentFromClassNode} for class declarations.
 *
 * @param node - The `ts-morph` AST node to inspect.
 * @param sourceFile - The project source file that contains the node.
 * @param options - Optional parsing configuration.
 * @param nodeOptions - Optional flags (e.g. `skipKindCheck`) to override default
 *   kind filtering.
 * @returns A {@link TypescriptDocument}, or `null` when the node has no TSDoc or
 *   is not a supported kind.
 */
export const extractDocumentFromNode = (
  node: Node,
  sourceFile: ProjectSourceFile,
  options?: ParseTsDocOptions,
  nodeOptions?: { skipKindCheck?: boolean },
): TypescriptDocument | null => {
  const kind = node.getKind();

  // Skip if not in our target kinds unless skipKindCheck is true
  if (!nodeOptions?.skipKindCheck && !nodeKinds.includes(kind)) {
    return null;
  }

  // Handle ClassDeclaration separately
  if (kind === SyntaxKind.ClassDeclaration) {
    return extractDocumentFromClassNode(node as ClassDeclaration, sourceFile, options);
  }

  // Handle VariableStatement (e.g., `export const bundleApp = ...`)
  if (kind === SyntaxKind.VariableStatement) {
    const declaration = (node as VariableStatement)
      .getDeclarations()
      // Variable statements may declare multiple bindings; find the actual declaration node
      .find((d) => d.getKind() === SyntaxKind.VariableDeclaration);

    // Skip malformed statements with no declaration
    if (!declaration) {
      return null;
    }

    const initializer = declaration.getInitializer();
    // Only arrow functions and function expressions are documentable as functions
    if (
      !initializer ||
      !(
        initializer.getKind() === SyntaxKind.ArrowFunction ||
        initializer.getKind() === SyntaxKind.FunctionExpression
      )
    ) {
      return null;
    }

    // Get the TSDoc comment from the VariableStatement
    const docCommentRange = node
      .getLeadingCommentRanges()
      // Only the TSDoc block comment counts, not plain `//` or `/* */` comments
      .find((range) => range.getText().startsWith('/**'));

    // Skip undocumented statements — nothing to index
    if (!docCommentRange) {
      return null;
    }

    const nodeName = declaration.getName() || 'missing_name_of_node';
    const docComment = docCommentRange.getText();

    // Only include the TSDoc comment for functions/lambdas
    return createTypescriptDocument(
      sourceFile,
      docComment,
      initializer.getKindName(),
      nodeName,
      options,
    );
  }

  // Get name if node has one
  const nodeName = Node.hasName(node) ? node.getName() : 'missing_name_of_node';

  // Find TSDoc comment (/** ... */)
  const docCommentRange = node
    .getLeadingCommentRanges()
    // Only the TSDoc block comment counts, not plain `//` or `/* */` comments
    .find((range) => range.getText().startsWith('/**'));

  // Skip undocumented nodes — nothing to index
  if (!docCommentRange) {
    return null;
  }

  const docComment = docCommentRange.getText();
  let pageContent = docComment;

  // For interfaces and type aliases, include the full code
  if (kind === SyntaxKind.InterfaceDeclaration || kind === SyntaxKind.TypeAliasDeclaration) {
    pageContent = `${docComment}\n${node.getText()}`;
  }
  // For other nodes (e.g., FunctionDeclaration), include only TSDoc
  else if (kind !== SyntaxKind.FunctionDeclaration) {
    return null; // Skip unsupported kinds
  }

  return createTypescriptDocument(sourceFile, pageContent, node.getKindName(), nodeName, options);
};
