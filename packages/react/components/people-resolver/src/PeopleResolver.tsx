import { useEffect, useRef } from 'react';

import {
    PersonProviderElement,
    PersonAvatarElement,
    PersonCardElement,
    PersonResolver,
    PersonListItemElement,
} from '@equinor/fusion-wc-person';

PersonProviderElement;
PersonAvatarElement;
PersonCardElement;
PersonListItemElement;

export const PeopleResolver = (props: React.PropsWithChildren<{ resolver: PersonResolver }>) => {
    const { resolver, children } = props;
    const ref = useRef<PersonProviderElement | null>(null);
    useEffect(() => {
        if (ref.current && resolver) {
            ref.current.setResolver(resolver);
        }
    }, [ref, resolver]);
    return <fwc-person-provider ref={ref}>{children}</fwc-person-provider>;

};
