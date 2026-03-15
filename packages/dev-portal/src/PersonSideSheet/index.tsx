import { useCallback, useMemo, useState } from 'react';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import PersonListItem from '@equinor/fusion-wc-person/list-item';
PersonListItem;

import { Divider } from '@equinor/eds-core-react';

import { LandingSheetContent, FeatureSheetContent } from './sheets';

/** Props for the {@link PersonSideSheet} component. */
type PersonSideSheetProps = {
  /** Azure AD object ID of the user to display in the side sheet. */
  readonly azureId?: string;
  /** Whether the side sheet is currently visible. */
  readonly isOpen: boolean;
  /** Callback invoked when the user dismisses the side sheet. */
  onClose(): void;
};

/**
 * Side sheet overlay that displays user settings and feature toggles.
 *
 * Contains a person list item for the current user and navigable sub-sheets
 * for viewing and toggling application and portal feature flags.
 *
 * @param props - {@link PersonSideSheetProps}
 */
export const PersonSideSheet = ({ azureId, isOpen, onClose }: PersonSideSheetProps) => {
  const [currentSheet, setCurrentSheet] = useState<string>('landing');

  const Component = useMemo(() => {
    switch (currentSheet) {
      case 'features':
        return FeatureSheetContent;
      default:
        return LandingSheetContent;
    }
  }, [currentSheet]);

  const navigateCallback = useCallback((sheet: string) => {
    setCurrentSheet(sheet ?? 'landing');
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
