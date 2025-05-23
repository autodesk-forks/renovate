import { getPkgReleases } from '..';
import * as githubGraphql from '../../../util/github/graphql';
import type { GithubTagItem } from '../../../util/github/graphql/types';
import * as hostRules from '../../../util/host-rules';
import type { Timestamp } from '../../../util/timestamp';
import { GithubTagsDatasource } from '.';
import * as httpMock from '~test/http-mock';
import { partial } from '~test/util';

const githubApiHost = 'https://api.github.com';

describe('modules/datasource/github-tags/index', () => {
  const github = new GithubTagsDatasource();

  beforeEach(() => {
    vi.spyOn(hostRules, 'hosts').mockReturnValue([]);
    vi.spyOn(hostRules, 'find').mockReturnValue({
      token: 'some-token',
    });
  });

  describe('getDigest', () => {
    const packageName = 'some/dep';

    it('returns commit digest', async () => {
      httpMock
        .scope(githubApiHost)
        .get(`/repos/${packageName}/commits?per_page=1`)
        .reply(200, [{ sha: 'abcdef' }]);

      const res = await github.getDigest({ packageName }, undefined);

      expect(res).toBe('abcdef');
    });

    it('returns null for missing commit', async () => {
      httpMock
        .scope(githubApiHost)
        .get(`/repos/${packageName}/commits?per_page=1`)
        .reply(200, []);
      const res = await github.getDigest({ packageName }, undefined);
      expect(res).toBeNull();
    });

    it('returns untagged commit digest', async () => {
      httpMock
        .scope(githubApiHost)
        .get(`/repos/${packageName}/commits?per_page=1`)
        .reply(200, [{ sha: 'abcdef' }]);
      const res = await github.getDigest({ packageName }, undefined);
      expect(res).toBe('abcdef');
    });

    it('returns tagged commit digest', async () => {
      vi.spyOn(githubGraphql, 'queryTags').mockResolvedValueOnce([
        {
          version: 'v1.0.0',
          gitRef: 'v1.0.0',
          releaseTimestamp: '2021-01-01' as Timestamp,
          hash: '123',
        },
        {
          version: 'v2.0.0',
          gitRef: 'v2.0.0',
          releaseTimestamp: '2022-01-01' as Timestamp,
          hash: 'abc',
        },
      ]);
      const res = await github.getDigest({ packageName }, 'v2.0.0');
      expect(res).toBe('abc');
    });

    it('returns null for missing hash', async () => {
      vi.spyOn(githubGraphql, 'queryTags').mockResolvedValueOnce([
        {
          version: 'v1.0.0',
          gitRef: 'v1.0.0',
          releaseTimestamp: '2021-01-01' as Timestamp,
          hash: '123',
        },
        partial<GithubTagItem>({
          version: 'v2.0.0',
          gitRef: 'v2.0.0',
          releaseTimestamp: '2022-01-01' as Timestamp,
        }),
      ]);
      const res = await github.getDigest({ packageName }, 'v2.0.0');
      expect(res).toBeNull();
    });

    it('returns null for missing tagged commit digest', async () => {
      vi.spyOn(githubGraphql, 'queryTags').mockResolvedValueOnce([
        {
          version: 'v1.0.0',
          gitRef: 'v1.0.0',
          releaseTimestamp: '2021-01-01' as Timestamp,
          hash: '123',
        },
        {
          version: 'v2.0.0',
          gitRef: 'v2.0.0',
          releaseTimestamp: '2022-01-01' as Timestamp,
          hash: 'abc',
        },
      ]);
      const res = await github.getDigest({ packageName }, 'v3.0.0');
      expect(res).toBeNull();
    });

    it('returns null for error', async () => {
      vi.spyOn(githubGraphql, 'queryTags').mockRejectedValueOnce('error');
      const res = await github.getDigest({ packageName }, 'v3.0.0');
      expect(res).toBeNull();
    });
  });

  describe('getReleases', () => {
    const packageName = 'some/dep2';

    it('returns tags', async () => {
      vi.spyOn(githubGraphql, 'queryTags').mockResolvedValueOnce([
        {
          version: 'v1.0.0',
          gitRef: 'v1.0.0',
          releaseTimestamp: '2021-01-01' as Timestamp,
          hash: '123',
        },
        {
          version: 'v2.0.0',
          gitRef: 'v2.0.0',
          releaseTimestamp: '2022-01-01' as Timestamp,
          hash: 'abc',
        },
      ]);
      vi.spyOn(githubGraphql, 'queryReleases').mockResolvedValueOnce([
        {
          id: 1,
          version: 'v1.0.0',
          releaseTimestamp: '2021-01-01' as Timestamp,
          isStable: true,
          url: 'https://example.com',
          name: 'some/dep2',
          description: 'some description',
        },
        {
          id: 2,
          version: 'v2.0.0',
          releaseTimestamp: '2022-01-01' as Timestamp,
          isStable: false,
          url: 'https://example.com',
          name: 'some/dep2',
          description: 'some description',
        },
      ]);

      const res = await getPkgReleases({ datasource: github.id, packageName });

      expect(res).toEqual({
        registryUrl: 'https://github.com',
        releases: [
          {
            gitRef: 'v1.0.0',
            version: 'v1.0.0',
            releaseTimestamp: '2021-01-01T00:00:00.000Z',
            isStable: true,
            newDigest: '123',
          },
          {
            gitRef: 'v2.0.0',
            version: 'v2.0.0',
            releaseTimestamp: '2022-01-01T00:00:00.000Z',
            isStable: false,
            newDigest: 'abc',
          },
        ],

        sourceUrl: 'https://github.com/some/dep2',
      });
    });
  });
});
