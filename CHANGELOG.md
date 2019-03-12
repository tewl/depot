# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


## [v2.0.0] 2019-03-12
### Added
- directory.contents() has a new `recursive` parameter.

### Changed
- Removed promiseHelpers dependency on logger.

### Removed
- directory.files() has been replaced by directory.contents() with a new `recursive` parameter.
- Removed default logger instance that logs to console.


## [v1.2.0] 2019-03-07
### Changed
- Improved logger component to support adding and removing listeners.


## [v1.1.0] 2019-01-07
### Changed
Added a parameter to `spawn()` that allows environment variables to be set.


## [v1.0.0] 2018-09-07
### Added
Initial project creation.
