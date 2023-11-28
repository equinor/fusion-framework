import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { IconButton } from '@equinor/fusion-react-button';

type PersonSideSheetProps = {
    readonly azureId: string;
    readonly isOpen: boolean;
    onClose(): void;
};

export const PersonSideSheet = ({ azureId, isOpen, onClose }: PersonSideSheetProps) => {
    return (
        <SideSheet isOpen={isOpen} onClose={onClose} isDismissable={true}>
            <SideSheet.Title title="Person" />
            <SideSheet.SubTitle subTitle={'Person stuff'} />
            <SideSheet.Actions></SideSheet.Actions>
            <SideSheet.Content>
                <fwc-person-list-item azureId={azureId}></fwc-person-list-item>
                <section>
                    <ul>
                        <li>
                            <IconButton icon="work_outline">Some mother fucking value</IconButton>
                        </li>
                    </ul>
                </section>
            </SideSheet.Content>
        </SideSheet>
    );
};
