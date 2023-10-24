import { useEffect, useRef } from 'react';

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

export const PeopleResolverComponent = (
    props: React.PropsWithChildren<{ resolver: PersonResolver }>,
) => {
    const { resolver, children } = props;
    const ref = useRef<PersonProviderElement | null>(null);
    useEffect(() => {
        if (ref.current && resolver) {
            ref.current.resolver = resolver;
        }
    }, [ref, resolver]);
    return <fwc-person-provider ref={ref}>{children}</fwc-person-provider>;
};
