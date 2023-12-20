import { useState } from 'react';
import { FeatureTogglerApp } from './FeatureTogglerApp';
import { FeatureTogglerPortal } from './FeatureTogglerPortal';

import { Divider, Icon, Button, Tabs } from '@equinor/eds-core-react';
import { category } from '@equinor/eds-icons';
Icon.add({ category });

import type { SheetContentProps } from './types';

export const FeatureSheetContent = ({ navigate }: SheetContentProps) => {
    const [tab, setTab] = useState<number>(0);

    return (
        <section>
            <div>
                <div>
                    <Button variant="ghost" onClick={() => navigate()}>
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
                        <Tabs.Panel>
                            <FeatureTogglerApp />
                        </Tabs.Panel>
                        <Tabs.Panel>
                            <FeatureTogglerPortal />
                        </Tabs.Panel>
                    </Tabs.Panels>
                </Tabs>
            </div>
        </section>
    );
};
