# CHANGELOG
All notable changes to this project will be documented in this file.

## [0.7.1](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.7.0...0.7.1) - 2024/07/17
### Update:
- Dependency version for `@amazon-devices/react-native-device-info`.

## [0.7.0](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.6.0...0.7.0) - 2024/05/13
### Features
- Add third party attribution files
- Updated license to New Relic Pre-Release Software Notice v1.0

## [0.6.0](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.5.1...0.6.0) - 2024/05/08
### Features
- Add sample app
- Update installatino instructions
- More thorough documentation
- Supporting running sample app with agent source
- Scrips for local dev

## [0.5.1](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.5.0...0.5.1) - 2024/04/30
### Features
- Enhanced typescript config
- Agent can now be built into a npm package

### Bug Fixes:
- Re-enable gzip compression
- Use correct attributes when creating summary metric

## [0.5.0](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.4.0...0.5.0) - 2024/04/25
### Update:
- Add system properties.
- Disable NR API body compression because of a bug in the Kepler SDK v0.7. It's a temporary change, until the bug is fixed hopefully in the next SDK version.

## [0.4.0](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.3.1...0.4.0) - 2024/03/21
### Update:
- Start agent function signature (added app name parameter).
- Fixed addPageAction.

## [0.3.1](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.3.0...0.3.1) - 2024/03/15
### Add:
- Tests
### Update:
- Fix minor bugs.

## [0.3.0](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.2.0...0.3.0) - 2024/03/11
### Add:
- NR Metrics.
- Integration ID attributes.

## [0.2.0](https://github.com/newrelic-experimental/newrelic-kepler-agent/compare/0.1.0...0.2.0) - 2024/03/07
### Add:
- NR Logs.
- Console tracking.

## [0.1.0] - 2024/03/05
### Initial release:

- Capture JavaScript errors.
- Track HTTP requests, and responses.
- Promise rejection tracking.
- App navigation tracking, using breadcrumbs.
- Capture system attributes.
- Record custom events and attributes.
- Record custom breadcrumbs.
- Record custom errors.
- Video player tracking (using video trackers).
