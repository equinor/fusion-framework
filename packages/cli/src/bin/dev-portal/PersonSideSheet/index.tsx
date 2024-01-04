import { useCallback, useMemo, useState } from 'react';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { PersonListItem } from '@equinor/fusion-react-person';
// import type { ApiPerson_v4 } from '@equinor/fusion-framework-module-services/people/api-models.v4';

import { Divider } from '@equinor/eds-core-react';

import {
    LandingSheetContent,
    // AllocationSheetContent,
    // RoleSheetContent,
    FeatureSheetContent,
} from './sheets';

type PersonSideSheetProps = {
    readonly azureId?: string;
    readonly isOpen: boolean;
    onClose(): void;
};

export const PersonSideSheet = ({ azureId, isOpen, onClose }: PersonSideSheetProps) => {
    const [currentSheet, setCurrentSheet] = useState<string>('landing');

    const Component = useMemo(() => {
        let Comp;
        switch (currentSheet) {
            // case 'allocations':
            //     Comp = AllocationSheetContent;
            //     break;
            // case 'roles':
            //     Comp = RoleSheetContent;
            //     break;
            case 'features':
                Comp = FeatureSheetContent;
                break;
            default:
                Comp = LandingSheetContent;
                break;
        }

        return Comp;
    }, [currentSheet]);

    const navigateCallback = useCallback(
        (sheet: string) => {
            setCurrentSheet(sheet ?? 'default');
        },
        [setCurrentSheet],
    );

    return (
        <SideSheet isOpen={isOpen} onClose={onClose} isDismissable={true}>
            <SideSheet.Title title="User settings" />
            <SideSheet.SubTitle subTitle={'Settings for your user in Fusion portal'} />
            <SideSheet.Actions></SideSheet.Actions>
            <SideSheet.Content>
                <section style={{ paddingLeft: '0.5em' }}>
                    <div>
                        <PersonListItem azureId={azureId}></PersonListItem>
                    </div>
                    <Divider></Divider>
                    <Component
                        azureId={azureId}
                        sheet={currentSheet}
                        navigate={navigateCallback}
                    ></Component>
                </section>
            </SideSheet.Content>
        </SideSheet>
    );
};

export default PersonSideSheet;
