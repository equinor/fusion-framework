import { Children, isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MoreMenu } from '../components/row/MoreMenu';

describe('MoreMenu', () => {
  it('renders only actionable menu options when conditional entries are false', () => {
    const menu = MoreMenu({
      pRef: { current: null },
      onClose: vi.fn(),
      open: true,
      options: [
        {
          name: 'Edit',
          disabled: false,
          onClick: vi.fn(),
        },
        false,
      ],
    });
    const items = Children.toArray(menu.props.children);

    expect(items).toHaveLength(1);
    expect(isValidElement(items[0])).toBe(true);

    // Guard the element shape before inspecting the rendered action label.
    if (!isValidElement<{ children: ReactNode }>(items[0])) {
      throw new Error('Expected a valid menu item');
    }

    expect(Children.toArray(items[0].props.children)).toContain('Edit');
  });
});
