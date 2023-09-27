import {
    SearchableDropdown,
    SearchableDropdownSelectEvent,
} from '@equinor/fusion-react-searchable-dropdown';
import { useAppsResolver } from './Resolver';
import { useCallback } from 'react';

export const App = (): JSX.Element => {
    const { resolver } = useAppsResolver();

    const onSelect = useCallback(async (e: SearchableDropdownSelectEvent) => {
        console.log('search select event', e.currentTarget.controller.result[0].id);
    }, []);

    return (
        <SearchableDropdown
            label="Search Fusion"
            placeholder="Search all Fusion apps"
            variant="outlined"
            initialText="Type to start searching..."
            onSelect={onSelect}
            resolver={resolver}
        />
    );
};

export default App;
