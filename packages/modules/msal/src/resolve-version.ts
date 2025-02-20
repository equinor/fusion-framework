import semver, { type SemVer } from 'semver';

import { MsalModuleVersion } from './static';

export function resolveVersion(version: string | SemVer): {
  wantedVersion: SemVer;
  latestVersion: SemVer;
  isLatest: boolean;
  satisfiesLatest: boolean;
  enumVersion: MsalModuleVersion;
} {
  const wantedVersion = semver.coerce(version || MsalModuleVersion.Latest);
  const latestVersion = semver.coerce(MsalModuleVersion.Latest);
  // check if version is valid semver version
  if (!wantedVersion) {
    throw new Error(`Invalid version ${version} provided`);
  }

  if (!latestVersion) {
    throw new Error('Invalid latest version');
  }

  // check if version is greater than latest
  if (semver.gt(wantedVersion, latestVersion!)) {
    throw new Error(
      `Requested version ${version} is greater than the latest version ${MsalModuleVersion.Latest}`,
    );
  }

  const enumVersion = Object.values(MsalModuleVersion).find(
    (x) => semver.coerce(x)?.major === wantedVersion.major,
  ) as MsalModuleVersion;

  return {
    wantedVersion,
    latestVersion,
    enumVersion,
    isLatest: wantedVersion.compare(latestVersion) === 0,
    satisfiesLatest: wantedVersion.major === latestVersion.major,
  };
}

export default resolveVersion;
