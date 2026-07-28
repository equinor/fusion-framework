import { type PropsWithChildren, useEffect, useRef } from 'react';

import {
  PersonProviderElement,
  PersonAvatarElement,
  PersonCardElement,
  type PersonResolver,
  PersonListItemElement,
  PersonSelectElement,
} from '@equinor/fusion-wc-person';
export { PersonResolver } from '@equinor/fusion-wc-person';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'fwc-person-provider': React.DetailedHTMLProps<
        React.HTMLAttributes<PersonProviderElement>,
        PersonProviderElement
      >;
    }
  }
}

PersonProviderElement;
PersonAvatarElement;
PersonCardElement;
PersonListItemElement;
PersonSelectElement;

/**
 * Wraps the `fwc-person-provider` web component, wiring the given `PersonResolver` into it
 * once the underlying custom element is ready.
 *
 * @param props - Component props
 * @param props.resolver - The resolver used to fetch person data, photos, and search results
 * @param props.children - Elements rendered inside the person provider, typically person-related components
 * @returns The rendered `fwc-person-provider` element wrapping the given children
 */
export const PeopleResolverComponent = (props: PropsWithChildren<{ resolver: PersonResolver }>) => {
  const { resolver, children } = props;
  const ref = useRef<PersonProviderElement | null>(null);

  // when the element is ready, set the resolver
  useEffect(() => {
    // Only assign the resolver once the custom element ref has mounted
    if (ref.current && resolver) {
      ref.current.resolver = resolver;
    }
  }, [resolver]);

  return <fwc-person-provider ref={ref}>{children}</fwc-person-provider>;
};
