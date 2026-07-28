import type { ReactNode } from 'react';
import { makeStyles, createStyles } from '@equinor/fusion-react-styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: theme.colors.ui.background__default.getVariable('color'),
      padding: theme.spacing.comfortable.medium.getVariable('padding'),
    },
  }),
);

/**
 * Provides the centered page layout used by the styling cookbook.
 * @param children - Content arranged inside the page layout.
 * @returns A themed container element.
 */
export const Container = ({ children }: { children: ReactNode }) => {
  const classes = useStyles({});

  return <div className={classes.container}>{children}</div>;
};
