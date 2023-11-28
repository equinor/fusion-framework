import { ChangeEventHandler, useState, ChangeEvent } from 'react';
import { Divider, Icon, Button, Tabs, Switch } from '@equinor/eds-core-react';
import { arrow_back, security } from '@equinor/eds-icons';
Icon.add({ arrow_back, security });

import styled, { css } from 'styled-components';

const SwitchList = styled.ul`
    list-style: none;
    padding-left: 0;
`;
const SwitchListItem = styled.li`
    margin: 1em 0;
`;
const InlineFlex = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
`;
const ExpireTime = styled.span<{ $checked?: boolean }>`
    ${(props) =>
        props.$checked
            ? css`
                  display: inline;
              `
            : css`
                  display: none;
              `}
`;

type SheetContentProps = {
    readonly azureId?: string;
    readonly sheet?: string;
    setSheet(sheet: string): void;
};

export const RoleSheetContent = ({ setSheet }: SheetContentProps) => {
    const [tab, setTab] = useState<number>(0);
    const [checked, setChecked] = useState<boolean>(false);
    const [checked2, setChecked2] = useState<boolean>(false);

    return (
        <section>
            <div>
                <div>
                    <Button variant="ghost" onClick={() => setSheet('landing')}>
                        <Icon name="arrow_back"></Icon>
                        <Icon name="security"></Icon>
                        My Roles
                    </Button>
                </div>
            </div>
            <Divider></Divider>
            <Tabs activeTab={tab} onChange={(index) => setTab(index)}>
                <Tabs.List>
                    <Tabs.Tab>Claimable</Tabs.Tab>
                    <Tabs.Tab>Permanent</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panels>
                    <Tabs.Panel>
                        <SwitchList>
                            <SwitchListItem>
                                <div>
                                    <Switch
                                        label="Access fusion people search"
                                        checked={checked}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            setChecked(e.target.checked)
                                        }
                                    />
                                    <InlineFlex>
                                        <span>Fusion.People.Search</span>
                                        <ExpireTime $checked={checked}>
                                            Expires in 2 Hours
                                        </ExpireTime>
                                    </InlineFlex>
                                </div>
                            </SwitchListItem>
                            <SwitchListItem>
                                <div>
                                    <Switch
                                        label="Fusion OrgChart reader"
                                        checked={checked2}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            setChecked2(e.target.checked)
                                        }
                                    />
                                    <InlineFlex>
                                        <span>Fusion.OrgChart.Read</span>
                                        <ExpireTime $checked={checked2}>
                                            Expires in 4 Hours
                                        </ExpireTime>
                                    </InlineFlex>
                                </div>
                            </SwitchListItem>
                        </SwitchList>
                    </Tabs.Panel>
                    <Tabs.Panel>Permanent roles</Tabs.Panel>
                </Tabs.Panels>
            </Tabs>
        </section>
    );
};
