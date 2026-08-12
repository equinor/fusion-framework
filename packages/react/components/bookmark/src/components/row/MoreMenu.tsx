import { Menu } from '@equinor/eds-core-react';
import type { MutableRefObject } from 'react';
import type { MenuOption } from './Row';

type MenuProps = {
  readonly pRef: MutableRefObject<HTMLElement | null>;
  readonly onClose: VoidFunction;
  readonly open: boolean;
  readonly options: Array<MenuOption | false | null | undefined>;
};

/**
 * A dropdown menu of row actions anchored to a reference element.
 *
 * @param props - The component's props
 * @returns The menu
 */
export const MoreMenu = ({ pRef, onClose, open, options }: MenuProps) => {
  const items = options
    // Conditional action arrays can contain placeholders that must not become empty EDS menu rows.
    .filter((option): option is MenuOption => Boolean(option))
    // Render one menu item per configured row action.
    .map(({ onClick, name, disabled, Icon }) => (
      <Menu.Item
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClick();
          onClose();
        }}
        key={name}
      >
        {Icon && Icon}
        {name}
      </Menu.Item>
    ));

  return (
    <Menu open={open} anchorEl={pRef.current}>
      {items}
    </Menu>
  );
};
