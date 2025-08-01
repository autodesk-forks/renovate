import { CONFIG_GIT_URL_UNAVAILABLE } from '../../../constants/error-messages';
import type { Repo } from './types';
import {
  getMergeMethod,
  getRepoUrl,
  trimTrailingApiPath,
  usableRepo,
} from './utils';
import { partial } from '~test/util';

describe('modules/platform/forgejo/utils', () => {
  const mockRepo = partial<Repo>({
    allow_rebase: true,
    clone_url: 'https://forgejo.renovatebot.com/some/repo.git',
    ssh_url: 'git@forgejo.renovatebot.com/some/repo.git',
    default_branch: 'master',
    full_name: 'some/repo',
    permissions: {
      pull: true,
      push: true,
      admin: false,
    },
    has_pull_requests: true,
  });

  it('trimTrailingApiPath', () => {
    expect(trimTrailingApiPath('https://forgejo.renovatebot.com/api/v1')).toBe(
      'https://forgejo.renovatebot.com/',
    );
    expect(trimTrailingApiPath('https://forgejo.renovatebot.com/api/v1/')).toBe(
      'https://forgejo.renovatebot.com/',
    );
    expect(trimTrailingApiPath('https://forgejo.renovatebot.com/')).toBe(
      'https://forgejo.renovatebot.com/',
    );
    expect(trimTrailingApiPath('https://forgejo.renovatebot.com')).toBe(
      'https://forgejo.renovatebot.com',
    );
    expect(
      trimTrailingApiPath('https://forgejo.renovatebot.com/api/forgejo/api/v1'),
    ).toBe('https://forgejo.renovatebot.com/api/forgejo/');
  });

  describe('getRepoUrl', () => {
    it('should abort when endpoint is not valid', () => {
      expect.assertions(1);
      expect(() => getRepoUrl(mockRepo, 'endpoint', 'abc')).toThrow(
        CONFIG_GIT_URL_UNAVAILABLE,
      );
    });
  });

  it.each`
    value             | expected
    ${'auto'}         | ${null}
    ${undefined}      | ${null}
    ${'fast-forward'} | ${'rebase'}
    ${'merge-commit'} | ${'merge'}
    ${'rebase'}       | ${'rebase-merge'}
    ${'squash'}       | ${'squash'}
  `('getMergeMethod("$value") == "$expected"', ({ value, expected }) => {
    expect(getMergeMethod(value)).toBe(expected);
  });

  describe('usableRepo', () => {
    it('should return true when repo is usable', () => {
      expect(usableRepo(mockRepo)).toBe(true);
    });

    it('should return false when repo lacks permissions', () => {
      expect(
        usableRepo({
          ...mockRepo,
          permissions: { pull: false, push: false, admin: true },
        }),
      ).toBe(false);
      expect(
        usableRepo({
          ...mockRepo,
          permissions: { pull: true, push: false, admin: true },
        }),
      ).toBe(false);
    });

    it('should return false when repo has disabled pull requests', () => {
      expect(usableRepo({ ...mockRepo, has_pull_requests: false })).toBe(false);
    });
  });
});
