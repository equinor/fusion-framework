import { useState } from 'react';
import { Divider, Icon, Button, Tabs } from '@equinor/eds-core-react';
import { arrow_back, work_outline, security } from '@equinor/eds-icons';
Icon.add({ arrow_back, work_outline, security });

type SheetContentProps = {
    readonly azureId?: string;
    readonly sheet?: string;
    setSheet(sheet: string): void;
};

export const AllocationSheetContent = ({ setSheet }: SheetContentProps) => {
    const [tab, setTab] = useState<number>(0);

    return (
        <section>
            <div>
                <div>
                    <Button variant="ghost" onClick={() => setSheet('landing')}>
                        <Icon name="arrow_back"></Icon>
                        <Icon name="work_outline"></Icon>
                        My allocations
                    </Button>
                </div>
            </div>
            <Divider></Divider>
            <Tabs activeTab={tab} onChange={(index) => setTab(index)}>
                <Tabs.List>
                    <Tabs.Tab>Active allocations</Tabs.Tab>
                    <Tabs.Tab>Past allocations</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panels>
                    <Tabs.Panel>Active allocations panel</Tabs.Panel>
                    <Tabs.Panel>Past allocations panel</Tabs.Panel>
                </Tabs.Panels>
            </Tabs>
        </section>
    );
};
