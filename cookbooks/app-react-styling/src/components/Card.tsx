import { makeStyles, createStyles } from '@equinor/fusion-react-styles';

const useStyles = makeStyles(
  (theme) =>
    createStyles({
      card: {
        background: theme.colors.ui.background__light.getVariable('color'),
        padding: theme.spacing.comfortable.medium.getVariable('padding'),
        ...theme.elevation.raised.attributes,
        margin: `${theme.spacing.comfortable.medium.getVariable('padding')} 0`,
        width: '80%',
      },
    }),
  { name: 'Card' },
);

export const Card = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles({});
  return <div className={classes.card}>{children}</div>;
};
