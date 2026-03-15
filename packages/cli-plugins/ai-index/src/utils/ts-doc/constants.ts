import { SyntaxKind } from 'ts-morph';

/**
 * Top-level TypeScript syntax kinds that the TSDoc extractor inspects.
 *
 * Only nodes matching one of these kinds are considered for document
 * extraction; all other descendants are skipped.
 */
export const nodeKinds = [
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.ClassDeclaration,
  SyntaxKind.InterfaceDeclaration,
  SyntaxKind.TypeAliasDeclaration,
  SyntaxKind.VariableStatement,
  SyntaxKind.EnumDeclaration,
];
