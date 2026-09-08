import type { ReactNode } from 'react';
import { RolesApplicationView } from './application/RolesApplicationView';
import { CompactRolesView } from './compact/CompactRolesView';

/** Layout selection for the signed-in account's role overview. */
export interface RolesViewProps {
  /** Uses compact rows, information controls, and activation switches for narrow flyouts. */
  readonly compact?: boolean;
}

/**
 * Displays the signed-in account's active and claimable Roles V2 assignments.
 *
 * The component consumes the nearest {@link RolesProvider}, handles collection loading and retry
 * states, and claims assignments through the shared Roles module.
 *
 * @param props.compact - Uses the narrow flyout presentation instead of application cards.
 * @returns A tabbed active-role and claimable-role overview.
 *
 * @example
 * ```tsx
 * <RolesProvider>
 *   <RolesView compact />
 * </RolesProvider>
 * ```
 */
export const RolesView = ({ compact = false }: RolesViewProps): ReactNode =>
  compact ? <CompactRolesView /> : <RolesApplicationView />;
