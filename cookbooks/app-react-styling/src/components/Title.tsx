import { makeStyles, createStyles } from '@equinor/fusion-react-styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      color: theme.colors.text.static_icons__default.getVariable('color'),
      marginBottom: '2rem',
    },
  }),
);

export const Title = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles({});

  return <h1 className={classes.title}>{children}</h1>;
};
