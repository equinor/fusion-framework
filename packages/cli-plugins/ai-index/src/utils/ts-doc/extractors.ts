import {
  type SourceFile as ProjectSourceFile,
  SyntaxKind,
  Node,
  type VariableStatement,
  type ClassDeclaration,
  type MethodDeclaration,
  type PropertyDeclaration,
} from 'ts-morph';

import { generateChunkId } from '../generate-chunk-id.js';
import type { TypescriptDocument, ParseTsDocOptions } from './types.js';
import { nodeKinds } from './constants.js';

/**
 * Creates a TypescriptDocument from the given parameters.
 * @param sourceFile - The source file containing the node.
 * @param pageContent - The content of the document.
 * @param tsKind - The TypeScript node kind name.
 * @param tsName - The name of the TypeScript node.
 * @param options - Optional parsing configuration.
 * @param sourceOverride - Optional source path override (for cases where source needs transformation).
 * @returns A TypeScript document with metadata.
 */
const createTypescriptDocument = (
  sourceFile: ProjectSourceFile,
  pageContent: string,
  tsKind: string,
  tsName: string,
  options?: ParseTsDocOptions,
): TypescriptDocument => {
  const source = sourceFile.getFilePath().replace(/^\/+/, '');
  return {
    id: generateChunkId(source),
    pageContent,
    metadata: {
      source,
      ...(options?.projectRoot && { rootPath: options.projectRoot }),
      attributes: {
        type: 'tsdoc',
        ts_kind: tsKind,
        ts_name: tsName,
      },
    },
  };
};

/**
 * Extracts a vector-store document from a TypeScript class declaration.
 *
 * Collects the class-level TSDoc comment, constructor signature (if documented),
 * and all public members with TSDoc into a single document whose `pageContent`
 * mirrors a minimal class interface.
 *
 * @param classNode - The `ts-morph` {@link ClassDeclaration} node to inspect.
 * @param sourceFile - The project source file that contains the class.
 * @param _options - Optional parsing configuration.
 * @returns A {@link TypescriptDocument}, or `null` when the class has no TSDoc.
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

  return createTypescriptDocument(
    sourceFile,
    pageContent,
    classNode.getKindName(),
    className,
    _options,
  );
};

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
    .find((range) => range.getText().startsWith('/**'));

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

/**
 * Walks a TypeScript source file and extracts a {@link TypescriptDocument}
 * for every top-level declaration that carries a TSDoc comment.
 *
 * @param sourceFile - The `ts-morph` source file to traverse.
 * @param options - Optional parsing configuration.
 * @returns Array of extracted documents (one per documented declaration).
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
