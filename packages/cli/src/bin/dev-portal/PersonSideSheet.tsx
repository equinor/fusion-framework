import { Button, Icon } from '@equinor/eds-core-react';
import { useFramework } from '@equinor/fusion-framework-react';
import { SideSheet } from '@equinor/fusion-react-side-sheet';

type PersonSideSheetProps = {
    readonly isOpen: boolean;
    onClose(): void;
};

export const PersonSideSheet = ({ isOpen, onClose }: PersonSideSheetProps) => {
    const { event } = useFramework().modules;

    return (
        <SideSheet isOpen={isOpen} onClose={onClose} isDismissable={true}>
            <SideSheet.Indicator color={'#258800'} />
            <SideSheet.Title title="Person" />
            <SideSheet.SubTitle subTitle={'Person stuff'} />
            <SideSheet.Actions></SideSheet.Actions>
            <SideSheet.Content>
                <p>Wazz up</p>
            </SideSheet.Content>
        </SideSheet>
    );
};
