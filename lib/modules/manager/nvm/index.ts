import type { Category } from '../../../constants';
import { NodeVersionDatasource } from '../../datasource/node-version';
import * as nodeVersioning from '../../versioning/node';

export { extractPackageFile } from './extract';

export const displayName = 'nvm';
export const url = 'https://github.com/nvm-sh/nvm';

export const defaultConfig = {
  fileMatch: ['(^|/)\\.nvmrc$'],
  versioning: nodeVersioning.id,
  pinDigests: false,
};

export const categories: Category[] = ['js', 'node'];

export const supportedDatasources = [NodeVersionDatasource.id];
