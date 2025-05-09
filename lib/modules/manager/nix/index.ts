import { GitRefsDatasource } from '../../datasource/git-refs';

export { extractPackageFile } from './extract';
export { updateArtifacts } from './artifacts';

export const supportsLockFileMaintenance = true;

export const url = 'https://nix.dev';

export const defaultConfig = {
  managerFilePatterns: ['/(^|/)flake\\.nix$/'],
  commitMessageTopic: 'nix',
  commitMessageExtra: 'to {{newValue}}',
  enabled: false,
};

export const supportedDatasources = [GitRefsDatasource.id];
