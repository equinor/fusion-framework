/**
 * Shared props for person side sheet sub-pages.
 *
 * Each sheet content component receives these props from the parent
 * {@link PersonSideSheet} to support navigation between sheets.
 */
export type SheetContentProps = {
  /** Azure AD object ID of the current user. */
  readonly azureId?: string;
  /** Key of the currently active sheet. */
  readonly sheet?: string;
  /** Navigates to a different sheet by key, or back to the landing sheet when called without arguments. */
  navigate(sheet?: string): void;
};
