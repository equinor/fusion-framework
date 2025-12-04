import { makeStyles, createStyles } from '@equinor/fusion-react-styles';

type ButtonType = 'primary' | 'secondary';

const useStyles = makeStyles(
  (theme) =>
    createStyles({
      button: (props: { type: ButtonType }) => {
        const backgroundColor =
          props.type === 'primary'
            ? theme.colors.interactive.primary__resting.getVariable('color')
            : theme.colors.interactive.secondary__resting.getVariable('color');
        return {
          background: backgroundColor,
          color: theme.colors.text.static_icons__primary_white.getVariable('color'),
          border: 'none',
          borderRadius: '4px',
          padding: '0.75rem 1.5rem',
          cursor: 'pointer',
          marginTop: '1rem',
        };
      },
      txt: {
        fontSize: '1rem',
      },
    }),
  { name: 'Button' },
);

export const Button = ({
  onClick,
  type = 'secondary',
  children,
}: {
  onClick: () => void;
  type: ButtonType;
  children: React.ReactNode;
}) => {
  const classes = useStyles({ type });

  return (
    <button type="button" onClick={onClick} className={classes.button}>
      <span className={classes.txt}>{children}</span>
    </button>
  );
};
