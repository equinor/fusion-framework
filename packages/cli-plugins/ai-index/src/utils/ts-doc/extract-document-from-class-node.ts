import { SyntaxKind, type SourceFile as ProjectSourceFile, type ClassDeclaration } from 'ts-morph';
import type { MethodDeclaration, PropertyDeclaration } from 'ts-morph';

import type { TypescriptDocument, ParseTsDocOptions } from './types.js';
import { createTypescriptDocument } from './create-typescript-document.js';

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
    // Only the TSDoc block comment counts, not plain `//` or `/* */` comments
    .find((range) => range.getText().startsWith('/**'));

  // Skip undocumented classes — nothing to index
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
  // Only surface the constructor signature when it has documentation to show
  if (constructorNode) {
    const constructorDocCommentRange = constructorNode
      .getLeadingCommentRanges()
      // Only the TSDoc block comment counts, not plain `//` or `/* */` comments
      .find((range) => range.getText().startsWith('/**'));
    // Skip undocumented constructors — nothing to add to the page content
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
    ...classNode
      .getMethods()
      // Only public methods form part of the class's documented surface
      .filter((m) => m.hasModifier(SyntaxKind.PublicKeyword)),
    ...classNode
      .getProperties()
      // Only public properties form part of the class's documented surface
      .filter((p) => p.hasModifier(SyntaxKind.PublicKeyword)),
  ];

  publicMembers
    // Append each documented public member's TSDoc and signature to the page content
    .forEach((member) => {
      const memberDocCommentRange = member
        .getLeadingCommentRanges()
        // Only the TSDoc block comment counts, not plain `//` or `/* */` comments
        .find((range) => range.getText().startsWith('/**'));
      // Skip undocumented members — nothing to add to the page content
      if (memberDocCommentRange) {
        const memberDocComment = memberDocCommentRange.getText();
        let memberSignature = '';
        // Methods and properties render their signature differently
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
