import { isValidElement, type ReactElement } from 'react';
import { Icon, Typography } from '@equinor/eds-core-react';
import { describe, expect, it } from 'vitest';
import { Message, type PortalMessageType } from '../components/messages/Message';

type ElementWithChildren = ReactElement<{ children: ReactElement[] }>;

/** Renders `Message` shallowly and returns its icon and title elements. */
const renderMessage = (type: PortalMessageType) => {
  const wrapper = Message({ title: 'Title', type }) as ElementWithChildren;
  const [icon, content] = wrapper.props.children as [
    ReactElement<{ style?: { color?: string }; color?: string }>,
    ElementWithChildren,
  ];
  const [title] = content.props.children as [ReactElement<{ color?: string }>];
  return { icon, title };
};

describe('Message', () => {
  it.each<[PortalMessageType, string]>([
    ['Error', 'var(--eds-color-text-danger-subtle)'],
    ['Warning', 'var(--eds-color-text-warning-subtle)'],
    ['Info', 'var(--eds-color-text-accent-subtle)'],
    ['NoContent', 'var(--eds-color-text-accent-subtle)'],
  ])('colours the %s icon with a scheme-aware EDS variable via CSS', (type, expected) => {
    const { icon } = renderMessage(type);

    expect(isValidElement(icon)).toBe(true);
    expect(icon.type).toBe(Icon);
    // `color` would become an SVG `fill` attribute, where `var()` does not resolve reliably.
    expect(icon.props.color).toBeUndefined();
    expect(icon.props.style?.color).toBe(expected);
  });

  it('colours the title with the EDS strong neutral text variable', () => {
    const { title } = renderMessage('Info');

    expect(title.type).toBe(Typography);
    expect(title.props.color).toBe('var(--eds-color-text-neutral-strong)');
  });
});
