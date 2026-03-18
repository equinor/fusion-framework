import type { ReactNode } from 'react';
import { makeStyles, createStyles } from '@equinor/fusion-react-styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    text: {
      color: theme.colors.text.static_icons__default.getVariable('color'),
    },
  }),
);

export const Text = ({ children }: { children: ReactNode }) => {
  const classes = useStyles({});

  return <p className={classes.text}>{children}</p>;
};
