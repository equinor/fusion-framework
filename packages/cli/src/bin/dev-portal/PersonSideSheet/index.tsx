import { useCallback, useMemo, useState } from 'react';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import PersonListItem from '@equinor/fusion-wc-person/list-item';
PersonListItem;

import { Divider } from '@equinor/eds-core-react';

import { LandingSheetContent, FeatureSheetContent } from './sheets';

type PersonSideSheetProps = {
  readonly azureId?: string;
  readonly isOpen: boolean;
  onClose(): void;
};

/**
 * Add Sidesheet with settings for the current user.
 * @param PersonSideSheetProps
 */
export const PersonSideSheet = ({ azureId, isOpen, onClose }: PersonSideSheetProps) => {
  const [currentSheet, setCurrentSheet] = useState<string>('landing');

  const Component = useMemo(() => {
    let Comp;
    switch (currentSheet) {
      case 'features':
        Comp = FeatureSheetContent;
        break;
      default:
        Comp = LandingSheetContent;
        break;
    }

    return Comp;
  }, [currentSheet]);

  const navigateCallback = useCallback((sheet: string) => {
    setCurrentSheet(sheet ?? 'default');
  }, []);

  return (
    <SideSheet isOpen={isOpen} onClose={onClose} isDismissable={true}>
      <SideSheet.Title title="User settings" />
      <SideSheet.SubTitle subTitle={'Settings for your user in Fusion portal'} />
      <SideSheet.Actions />
      <SideSheet.Content>
        <section style={{ paddingLeft: '0.5em' }}>
          <div>
            <fwc-person-list-item azureId={azureId} />
          </div>
          <Divider />
          <Component azureId={azureId} sheet={currentSheet} navigate={navigateCallback} />
        </section>
      </SideSheet.Content>
    </SideSheet>
  );
};

export default PersonSideSheet;
