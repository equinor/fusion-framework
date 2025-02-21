import { type PropsWithChildren, useEffect, useRef } from 'react';

import {
  PersonProviderElement,
  PersonAvatarElement,
  PersonCardElement,
  PersonResolver,
  PersonListItemElement,
  PersonSelectElement,
} from '@equinor/fusion-wc-person';

PersonProviderElement;
PersonAvatarElement;
PersonCardElement;
PersonListItemElement;
PersonSelectElement;

export { PersonResolver };

export const PeopleResolverComponent = (props: PropsWithChildren<{ resolver: PersonResolver }>) => {
  const { resolver, children } = props;
  const ref = useRef<PersonProviderElement | null>(null);

  // when the element is ready, set the resolver
  useEffect(() => {
    if (ref.current && resolver) {
      ref.current.resolver = resolver;
    }
  }, [resolver]);

  return <fwc-person-provider ref={ref}>{children}</fwc-person-provider>;
};
