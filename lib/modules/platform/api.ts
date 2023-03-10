import type { PlatformId } from '../../constants';
import * as azure from './azure';
import * as bitbucket from './bitbucket';
import * as bitbucketServer from './bitbucket-server';
import * as codecommit from './codecommit';
import * as gitea from './gitea';
import * as github from './github';
import * as gitlab from './gitlab';
import type { Platform } from './types';

const api = new Map<PlatformId, Platform>();
export default api;

api.set('azure', azure);
api.set('bitbucket', bitbucket);
api.set('bitbucket-server', bitbucketServer);
api.set('codecommit', codecommit);
api.set('gitea', gitea);
api.set('github', github);
api.set('gitlab', gitlab);
