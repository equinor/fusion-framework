import type SemanticVersion from '../semantic-version.js';

export interface IModuleProvider {
  get version(): SemanticVersion;
  dispose: VoidFunction;
}
