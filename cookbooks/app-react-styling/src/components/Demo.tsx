import { makeStyles, createStyles } from '@equinor/fusion-react-styles';

const useStyles = makeStyles(
  (theme) =>
    createStyles({
      demo: {
        background: theme.colors.ui.background__warning.css,
        color: theme.colors.text.static_icons__default.css,
        padding: '2rem',
        borderRadius: '8px',
        margin: '1rem 0',
        border: `2px solid ${theme.colors.infographic.primary__lichen_green.getVariable('color')}`,
        ...theme.elevation.raised.attributes,
        fontWeight: 'bold',
      },
      title: {
        color: theme.colors.interactive.danger__resting.css,
        marginBottom: '1rem',
        fontSize: '1.5rem',
      },
      content: {
        color: theme.colors.text.static_icons__default.css,
        lineHeight: 1.8,
      },
    }),
  { name: 'Demo' },
);

export const Demo = () => {
  const classes = useStyles({});

  return (
    <div className={classes.demo}>
      <h3 className={classes.title}>🧪 Demo Component</h3>
      <p className={classes.content}>
        This component uses makeStyles with createStyles. When you remove this component, the
        stylesheet should be cleaned up automatically.
      </p>
      <p className={classes.content}>
        Check the DOM inspector to verify the stylesheet is removed when this component unmounts.
      </p>
    </div>
  );
};
