import { SyntaxKind } from 'ts-morph';

/**
 * Supported TSDoc node kinds for top-level processing
 */
export const nodeKinds = [
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.ClassDeclaration,
  SyntaxKind.InterfaceDeclaration,
  SyntaxKind.TypeAliasDeclaration,
  SyntaxKind.VariableStatement,
  SyntaxKind.EnumDeclaration,
];

