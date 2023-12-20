import { useState } from 'react';
import { Divider, Icon, Button, Tabs } from '@equinor/eds-core-react';
import { arrow_back, work_outline, security } from '@equinor/eds-icons';
Icon.add({ arrow_back, work_outline, security });

import type { SheetContentProps } from './types';

export const AllocationSheetContent = ({ navigate }: SheetContentProps) => {
    const [tab, setTab] = useState<number>(0);

    return (
        <section>
            <div>
                <div>
                    <Button variant="ghost" onClick={() => navigate()}>
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
