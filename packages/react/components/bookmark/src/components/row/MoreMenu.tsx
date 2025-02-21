import { Menu } from '@equinor/eds-core-react';
import type { MutableRefObject } from 'react';
import type { MenuOption } from './Row';

type MenuProps = {
  readonly pRef: MutableRefObject<HTMLElement | null>;
  readonly onClose: VoidFunction;
  readonly open: boolean;
  readonly options: MenuOption[];
};

export const MoreMenu = ({ pRef, onClose, open, options }: MenuProps) => {
  return (
    <Menu open={open} anchorEl={pRef.current}>
      {options.map(({ onClick, name, disabled, Icon }) => (
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
          <>
            {Icon && Icon}
            {name}
          </>
        </Menu.Item>
      ))}
    </Menu>
  );
};
