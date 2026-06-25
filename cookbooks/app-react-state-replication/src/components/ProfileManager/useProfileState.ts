import { useCallback, useState } from 'react';
import { useAppState } from '@equinor/fusion-framework-react-app/state';
import type { UserProfile } from '../../types';
import type { ProfileAction } from './profileActions';
import { createProfileReducer } from './profileReducer';

export const useProfileState = (): [UserProfile | undefined, (action: ProfileAction) => void] => {
  const [profileReducer] = useState(() => createProfileReducer());
  const [profile, setProfile] = useAppState<UserProfile>('user.profile', {
    defaultValue: profileReducer.getInitialState(),
  });

  // Dispatch function that applies reducer logic to the state
  const dispatch = useCallback(
    (action: ProfileAction) => {
      setProfile((prevProfile) =>
        prevProfile ? profileReducer(prevProfile, action) : prevProfile,
      );
    },
    [setProfile, profileReducer],
  );

  return [profile, dispatch];
};
