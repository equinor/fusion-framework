
import {
  type SourceFile as ProjectSourceFile,
  SyntaxKind,
  Node,
  type VariableStatement,
  type ClassDeclaration,
  type MethodDeclaration,
  type PropertyDeclaration,
} from 'ts-morph';

import { generateChunkId } from '../generate-cunk-id.js';
import type { TypescriptDocument, ParseTsDocOptions } from './types.js';
import { nodeKinds } from './constants.js';

/**
 * Extracts a TSDoc document from a class node, including TSDoc, constructor, and public member signatures.
 * @param classNode - The ClassDeclaration node to process.
 * @param sourceFile - The source file containing the node.
 * @param options - Optional parsing configuration.
 * @returns A TypeScript document with TSDoc and class interface, or null if no TSDoc is found.
 */
export const extractDocumentFromClassNode = (
  classNode: ClassDeclaration,
  sourceFile: ProjectSourceFile,
  _options?: ParseTsDocOptions,
): TypescriptDocument | null => {
  // Find TSDoc comment (/** ... */)
  const docCommentRange = classNode
    .getLeadingCommentRanges()
    .find((range) => range.getText().startsWith('/**'));

  if (!docCommentRange) {
    return null;
  }

  const docComment = docCommentRange.getText();
  const className = classNode.getName() || 'AnonymousClass';

  // Start with class TSDoc and declaration (without body)
  const classSignature = `${classNode.getText({ includeJsDocComments: false }).split('{')[0].trim()} {`;
  let pageContent = `${docComment}\n${classSignature}`;

  // Add constructor with TSDoc if present
  const constructorNode = classNode.getConstructors()[0]; // Get the first constructor (if any)
  if (constructorNode) {
    const constructorDocCommentRange = constructorNode
      .getLeadingCommentRanges()
      .find((range) => range.getText().startsWith('/**'));
    if (constructorDocCommentRange) {
      const constructorDocComment = constructorDocCommentRange.getText();
      const constructorSignature = constructorNode
        .getText({ includeJsDocComments: false })
        .split('{')[0]
        .trim();
      pageContent += `\n  ${constructorDocComment}\n  ${constructorSignature}`;
    }
  }

  // Add public methods and properties with TSDoc
  const publicMembers = [
    ...classNode.getMethods().filter((m) => m.hasModifier(SyntaxKind.PublicKeyword)),
    ...classNode.getProperties().filter((p) => p.hasModifier(SyntaxKind.PublicKeyword)),
  ];

  publicMembers.forEach((member) => {
    const memberDocCommentRange = member
      .getLeadingCommentRanges()
      .find((range) => range.getText().startsWith('/**'));
    if (memberDocCommentRange) {
      const memberDocComment = memberDocCommentRange.getText();
      let memberSignature = '';
      if (member.getKind() === SyntaxKind.MethodDeclaration) {
        memberSignature = (member as MethodDeclaration)
          .getText({ includeJsDocComments: false })
          .split('{')[0]
          .trim();
      } else if (member.getKind() === SyntaxKind.PropertyDeclaration) {
        memberSignature = (member as PropertyDeclaration)
          .getText({ includeJsDocComments: false })
          .trim();
      }
      pageContent += `\n  ${memberDocComment}\n  ${memberSignature}`;
    }
  });

  pageContent += '\n}';

  const source = sourceFile.getFilePath();
  return {
    id: generateChunkId(source),
    pageContent,
    metadata: {
      source,
      attributes: {
        type: 'tsdoc',
        ts_kind: classNode.getKindName(),
        ts_name: className,
      },
    },
  };
};

/**
 * Extracts a TSDoc document from a single node.
 * @param node - The TypeScript node to process.
 * @param sourceFile - The source file containing the node.
 * @param options - Optional parsing configuration.
 * @param nodeOptions - Optional node-specific configuration (e.g., skipKindCheck for VariableStatement).
 * @returns A TypeScript document with TSDoc metadata, or null if no TSDoc is found.
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
      .find((d) => d.getKind() === SyntaxKind.VariableDeclaration);

    if (!declaration) {
      return null;
    }

    const initializer = declaration.getInitializer();
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
      .find((range) => range.getText().startsWith('/**'));

    if (!docCommentRange) {
      return null;
    }

    const nodeName = declaration.getName() || 'missing_name_of_node';
    const docComment = docCommentRange.getText();
    const source = sourceFile.getFilePath();

    // Only include the TSDoc comment for functions/lambdas
    return {
      id: generateChunkId(source),
      pageContent: docComment,
      metadata: {
        source,
        rootPath: options?.projectRoot,
        attributes: {
          type: 'tsdoc',
          ts_kind: initializer.getKindName(),
          ts_name: nodeName,
        },
      },
    };
  }

  // Get name if node has one
  const nodeName = Node.hasName(node) ? node.getName() : 'missing_name_of_node';

  // Find TSDoc comment (/** ... */)
  const docCommentRange = node
    .getLeadingCommentRanges()
    .find((range) => range.getText().startsWith('/**'));

  if (!docCommentRange) {
    return null;
  }

  const docComment = docCommentRange.getText();
  let pageContent = docComment;
  const source = sourceFile.getFilePath();

  // For interfaces and type aliases, include the full code
  if (kind === SyntaxKind.InterfaceDeclaration || kind === SyntaxKind.TypeAliasDeclaration) {
    pageContent = `${docComment}\n${node.getText()}`;
  }
  // For other nodes (e.g., FunctionDeclaration), include only TSDoc
  else if (kind !== SyntaxKind.FunctionDeclaration) {
    return null; // Skip unsupported kinds
  }

  return {
    id: generateChunkId(source),
    pageContent,
    metadata: {
      source,
      rootPath: options?.projectRoot,
      attributes: {
        type: 'tsdoc',
        ts_kind: node.getKindName(),
        ts_name: nodeName,
      },
    },
  };
};

/**
 * Processes a TypeScript source file to extract TSDoc documents.
 * @param sourceFile - The source file to process.
 * @param options - Optional parsing configuration.
 * @returns An array of TypeScript documents with TSDoc metadata.
 */
export const processSourceFile = (
  sourceFile: ProjectSourceFile,
  options?: ParseTsDocOptions,
): TypescriptDocument[] => {
  const documents: TypescriptDocument[] = [];

  sourceFile.forEachDescendant((node) => {
    const document = extractDocumentFromNode(node, sourceFile, options);
    if (document) {
      documents.push(document);
    }
  });

  return documents;
};
