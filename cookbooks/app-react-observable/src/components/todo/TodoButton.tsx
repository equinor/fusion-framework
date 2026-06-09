import type { ButtonHTMLAttributes, ReactElement } from 'react';

import { buttonStyle } from '../styles';

/**
 * Renders a consistent button for todo commands.
 *
 * @param props - Native button props forwarded to the button element.
 * @returns A styled todo command button.
 * @example
 * <TodoButton onClick={save}>Save</TodoButton>
 */
export const TodoButton = (props: ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => {
  return <button type="button" style={buttonStyle} {...props} />;
};
