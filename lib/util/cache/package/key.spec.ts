import { getCombinedKey } from './key';

describe('util/cache/package/key', () => {
  describe('getCombinedKey', () => {
    it('works', () => {
      expect(getCombinedKey('_test-namespace', 'foo:bar')).toBe(
        'datasource-mem:pkg-fetch:_test-namespace:foo:bar',
      );
    });
  });
});
