import SemanticVersion from "../semantic-version";

export interface IModuleProvider {
  get version(): SemanticVersion;
  dispose: VoidFunction;
}