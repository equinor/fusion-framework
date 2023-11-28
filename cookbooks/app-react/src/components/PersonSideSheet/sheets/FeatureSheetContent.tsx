import { useState } from 'react';
import { Divider, Icon, Button, Tabs } from '@equinor/eds-core-react';
import { category } from '@equinor/eds-icons';
Icon.add({ category });

type SheetContentProps = {
    readonly azureId?: string;
    readonly sheet?: string;
    setSheet(sheet: string): void;
};

export const FeatureSheetContent = ({ setSheet }: SheetContentProps) => {
    const [tab, setTab] = useState<number>(0);

    return (
        <section>
            <div>
                <div>
                    <Button variant="ghost" onClick={() => setSheet('landing')}>
                        <Icon name="arrow_back"></Icon>
                        <Icon name="category"></Icon>
                        My Features
                    </Button>
                </div>
            </div>
            <Divider></Divider>
            <div>
                <Tabs activeTab={tab} onChange={(index) => setTab(index)}>
                    <Tabs.List>
                        <Tabs.Tab>App features</Tabs.Tab>
                        <Tabs.Tab>Portal features</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panels>
                        <Tabs.Panel>App features panel</Tabs.Panel>
                        <Tabs.Panel>Portal features roles</Tabs.Panel>
                    </Tabs.Panels>
                </Tabs>
            </div>
        </section>
    );
};
