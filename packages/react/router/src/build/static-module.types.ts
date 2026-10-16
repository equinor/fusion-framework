import type { Expression } from 'acorn';

/** A trusted DSL builder that may be called while reading a static registry. */
export type StaticBuilder = (...args: unknown[]) => unknown;

/** Imported DSL names mapped to the only builders static evaluation may invoke. */
export type StaticCalls = Readonly<Record<string, StaticBuilder>>;

/** Source-only access to exports and literal metadata without importing modules. */
export interface StaticModule {
  /**
   * Finds the local expression corresponding to an exported name.
   * @param name - Default or named export to inspect.
   * @returns The exported expression, if present.
   */
  getExport(name: string): Expression | undefined;
  /**
   * Selects metadata without evaluating unrelated UI-only handle properties.
   * @param expression - Object literal or reference to a local object.
   * @param name - Property name to find.
   * @returns The property's expression, if present.
   * @throws When the object or property cannot be resolved statically.
   */
  getProperty(expression: Expression, name: string): Expression | undefined;
  /**
   * Resolves literals, local references and permitted DSL calls.
   * @param expression - Expression reachable from requested route metadata.
   * @returns The literal data or trusted builder result.
   * @throws When the expression is unsupported or cyclic.
   */
  evaluate(expression: Expression): unknown;
}
