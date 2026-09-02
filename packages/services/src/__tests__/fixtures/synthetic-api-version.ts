/**
 * Test-only API with two versions.
 *
 * The production Roles service publishes version 1.0 only, so a synthetic enum is
 * the only way to prove that the version generics discriminate between versions
 * without adding an unsupported version to the shipped `ApiVersion`.
 */
export enum SyntheticApiVersion {
  /** Synthetic API version 1.0. */
  v1 = '1.0',
  /** Synthetic API version 2.0. */
  v2 = '2.0',
}
