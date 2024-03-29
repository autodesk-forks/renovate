Composer uses Semver-like versioning, but some package authors may use versions that are not completely valid, e.g. `1.2` instead of `1.2.0`.

Composer supports ranges in a similar manner to npm, but not identical. The main difference is with tilde ranges.

Tilde ranges with "short" versions are different to npm. e.g.

`~4` is equivalent to `^4` in npm
`~4.1` is equivalent to `^4.1` in npm
`~0.4` is equivalent to `>=0.4 <1` in npm

Composer supports patches in the version numbers, which are considered stable. E.g., `1.2.3-p1` is recognized by npm as unstable, Renovate
implements additional logic to support correct sorting and stability checks on composer patch versions syntax.
