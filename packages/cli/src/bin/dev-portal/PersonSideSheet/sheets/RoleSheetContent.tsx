// import { useState } from 'react';
// import { Divider, Icon, Button, Tabs, Typography, Switch } from '@equinor/eds-core-react';
// import { arrow_back, security } from '@equinor/eds-icons';
// Icon.add({ arrow_back, security });
// import type { SheetContentProps } from './types';

// import { Styled } from './Styled';

// import styled, { css } from 'styled-components';

// const ExpireTime = styled.span<{ $checked?: boolean }>`
//     ${(props) =>
//         props.$checked
//             ? css`
//                   display: inline;
//               `
//             : css`
//                   display: none;
//               `}
// `;

// export const RoleSheetContent = ({ user, navigate }: SheetContentProps) => {
//     const [tab, setTab] = useState<number>(0);
//     return;
//     return (
//         <section>
//             <div>
//                 <div>
//                     <Button variant="ghost" onClick={() => navigate()}>
//                         <Icon name="arrow_back"></Icon>
//                         <Icon name="security"></Icon>
//                         My Roles
//                     </Button>
//                 </div>
//             </div>
//             <Divider></Divider>
//             <Tabs activeTab={tab} onChange={(index) => setTab(index)}>
//                 <Tabs.List>
//                     <Tabs.Tab>Claimable</Tabs.Tab>
//                     <Tabs.Tab>Permanent</Tabs.Tab>
//                 </Tabs.List>
//                 <Tabs.Panels>
//                     <Tabs.Panel>
//                         <Styled.SwitchList>
//                             {user?.roles
//                                 ?.filter((r) => r.onDemandSupport)
//                                 .map((role) => (
//                                     <Styled.SwitchListItem
//                                         key={`feat-${role.name}`}
//                                         onClick={() =>
//                                             console.log('Setting role active?:', !role.isActive)
//                                         }
//                                     >
//                                         <Styled.SwitchLabel>
//                                             <Typography variant="body_short_bold">
//                                                 {role.name}
//                                             </Typography>
//                                             <Typography variant="body_short_italic">
//                                                 {role.displayName}
//                                             </Typography>
//                                         </Styled.SwitchLabel>
//                                         <Switch
//                                             checked={role.isActive}
//                                             onChange={(e) => console.log(e)}
//                                         />
//                                     </Styled.SwitchListItem>
//                                 ))}
//                         </Styled.SwitchList>
//                     </Tabs.Panel>
//                     <Tabs.Panel>
//                         <Styled.SwitchList>
//                             {user?.roles
//                                 ?.filter((r) => !r.onDemandSupport)
//                                 .map((role) => (
//                                     <Styled.SwitchListItem key={`feat-${role.name}`}>
//                                         <Styled.SwitchLabel>
//                                             <Typography variant="body_short_bold">
//                                                 {role.name}
//                                             </Typography>
//                                             <Typography variant="body_short_italic">
//                                                 {role.displayName}
//                                             </Typography>
//                                         </Styled.SwitchLabel>
//                                         <Switch
//                                             checked={role.isActive}
//                                             disabled={true}
//                                             onChange={(e) => console.log(e)}
//                                         />
//                                     </Styled.SwitchListItem>
//                                 ))}
//                         </Styled.SwitchList>
//                     </Tabs.Panel>
//                 </Tabs.Panels>
//             </Tabs>
//         </section>
//     );
// };
