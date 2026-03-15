import type React from 'react';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

/**
 * Full-viewport loading indicator displaying the Equinor star spinner.
 *
 * Used as a fallback while the Fusion Framework or an application is initializing.
 *
 * @param props.text - Status message displayed below the spinner.
 * @param props.children - Optional additional content rendered inside the spinner.
 * @returns A centered full-screen loading overlay.
 */
export const EquinorLoader = ({
  children,
  text,
}: React.PropsWithChildren<{ readonly text: string }>): React.ReactElement => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <StarProgress text={text}>{children}</StarProgress>
    </div>
  );
};

export default EquinorLoader;
