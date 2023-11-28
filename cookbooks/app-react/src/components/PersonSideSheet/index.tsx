import { useMemo, useState } from 'react';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { PersonListItem } from '@equinor/fusion-react-person';
// import { List, ListItem } from '@equinor/fusion-react-list';

import { Divider } from '@equinor/eds-core-react';

import {
    LandingSheetContent,
    AllocationSheetContent,
    RoleSheetContent,
    FeatureSheetContent,
} from './sheets';

import styled from 'styled-components';

const HorizontalPadding = styled.ul`
    padding-left: 1em;
    padding-right: 1em;
`;

type PersonSideSheetProps = {
    readonly azureId: string;
    readonly isOpen: boolean;
    onClose(): void;
};

export const PersonSideSheet = ({ azureId, isOpen, onClose }: PersonSideSheetProps) => {
    const [currentSheet, setCurrentSheet] = useState<string>('landing');

    const Component = useMemo(() => {
        let Comp;
        switch (currentSheet) {
            case 'allocations':
                Comp = AllocationSheetContent;
                break;
            case 'roles':
                Comp = RoleSheetContent;
                break;
            case 'features':
                Comp = FeatureSheetContent;
                break;
            default:
                Comp = LandingSheetContent;
                break;
        }

        return Comp;
    }, [currentSheet]);

    return (
        <SideSheet isOpen={isOpen} onClose={onClose} isDismissable={true}>
            <SideSheet.Title title="User settings" />
            <SideSheet.SubTitle
                subTitle={'Settings for your user experience in the amazing Fusion portal'}
            />
            <SideSheet.Actions></SideSheet.Actions>
            <SideSheet.Content>
                <section>
                    <div>
                        <PersonListItem azureId={azureId}></PersonListItem>
                    </div>
                    <Divider></Divider>
                    <HorizontalPadding>
                        <Component
                            azureId={azureId}
                            sheet={currentSheet}
                            setSheet={setCurrentSheet}
                        ></Component>
                    </HorizontalPadding>
                </section>
            </SideSheet.Content>
        </SideSheet>
    );
};

export default PersonSideSheet;
