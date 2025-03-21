import { Divider, Icon, Button } from '@equinor/eds-core-react';
import { bandage, category, work_outline, security } from '@equinor/eds-icons';
Icon.add({ bandage, category, work_outline, security });

import type { SheetContentProps } from './types';

import styled from 'styled-components';

const BtnList = styled.ul`
    list-style: none;
    padding-left: 0;
`;
const BtnListItem = styled.li`
    margin: 1em 0;
`;

/**
 * Content for the main  tab in the PersonSidesheet.
 */
export const LandingSheetContent = ({ azureId, navigate }: SheetContentProps) => {
  return (
    <section>
      <BtnList>
        <BtnListItem>
          <Button variant="ghost" onClick={() => navigate('features')}>
            <Icon name="category" />
            My Features
          </Button>
        </BtnListItem>
      </BtnList>
      <Divider />
      <BtnList>
        <BtnListItem>
          <Button
            variant="ghost"
            href={`https://eur.delve.office.com/?u=${azureId}&v=work`}
            target="_blank"
          >
            <svg height="24" viewBox="0 0 24 24" width="24">
              <title>Delve</title>
              <path
                d="M22.5 3C22.7031 3 22.8789 3.07422 23.0273 3.22266C23.1758 3.37109 23.25 3.54688 23.25 3.75V20.25C23.25 20.4531 23.1758 20.6289 23.0273 20.7773C22.8789 20.9258 22.7031 21 22.5 21H14.25V23.3438L0.75 20.9883V3.08203L14.25 0.65625V3H22.5ZM7.07812 16.6992C7.52344 16.6992 7.92188 16.6289 8.27344 16.4883C8.625 16.3477 8.9375 16.1602 9.21094 15.9258C9.48438 15.6914 9.71484 15.4102 9.90234 15.082C10.0898 14.7539 10.25 14.4062 10.3828 14.0391C10.5156 13.6719 10.6055 13.293 10.6523 12.9023C10.6992 12.5117 10.7266 12.1289 10.7344 11.7539C10.7344 11.1602 10.6836 10.5859 10.582 10.0312C10.4805 9.47656 10.3008 8.98047 10.043 8.54297C9.78516 8.10547 9.42969 7.75781 8.97656 7.5C8.52344 7.24219 7.95312 7.10938 7.26562 7.10156C6.78906 7.10156 6.3125 7.12891 5.83594 7.18359C5.35938 7.23828 4.88281 7.28906 4.40625 7.33594V16.5117L5.74219 16.6289C6.1875 16.668 6.63281 16.6914 7.07812 16.6992ZM17.25 16.5H14.25V20.25H17.25V16.5ZM17.25 3.75H14.25V15.75H17.25V3.75ZM22.5 9H18V20.25H22.5V9ZM22.5 3.75H18V8.25H22.5V3.75ZM5.89453 8.92969C6.04297 8.91406 6.1875 8.90234 6.32812 8.89453C6.46875 8.88672 6.62109 8.88281 6.78516 8.88281C7.19141 8.88281 7.53125 8.96875 7.80469 9.14062C8.07812 9.3125 8.29688 9.53906 8.46094 9.82031C8.625 10.1016 8.74219 10.4141 8.8125 10.7578C8.88281 11.1016 8.91797 11.4453 8.91797 11.7891C8.91797 12.125 8.88672 12.4766 8.82422 12.8438C8.76172 13.2109 8.64453 13.5508 8.47266 13.8633C8.30078 14.1758 8.08203 14.4297 7.81641 14.625C7.55078 14.8203 7.20312 14.9219 6.77344 14.9297H6.33984C6.19922 14.9297 6.05078 14.9219 5.89453 14.9062V8.92969Z"
                fill="currentColor"
              />
            </svg>
            Delve
          </Button>
        </BtnListItem>
      </BtnList>
    </section>
  );
};
