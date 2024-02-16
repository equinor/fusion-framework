import { Button, Icon } from '@equinor/eds-core-react';
import { tag } from '@equinor/eds-icons';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { useState } from 'react';

type WidgetProps = {
    test: string;
};

export const Widget = ({ test }: WidgetProps) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Icon data={tag} /> Widget 1
            </Button>
            <div style={{ position: 'absolute' }}>
                <SideSheet
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    isDismissable={true}
                    enableFullscreen={true}
                >
                    <SideSheet.Indicator color={'#258800'} />
                    <SideSheet.Title title="Widget1" />
                    <SideSheet.SubTitle subTitle={'This is a test widget,'} />
                    <SideSheet.Actions></SideSheet.Actions>
                    <SideSheet.Content>
                        <h1>🚀 Hello from my test widget 1! 😎</h1>
                        <p> To run this widget in app see the implementation in the</p>
                        <p>
                            <b>app-react-widget</b> cookbook
                        </p>
                        <p>This is a prop from parent component:</p>
                        <b> {test}</b>
                    </SideSheet.Content>
                </SideSheet>
            </div>
        </>
    );
};
