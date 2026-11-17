# CHANGELOG
All notable changes to this project will be documented in this file.

## [0.0.4-beta] - 2026/11/17
### Changed:

- Upgraded sample app from React Native 0.72 to React Native 0.83 (Vega SDK 2.0 support).
- Updated Jest configuration for RN 0.83 compatibility (moduleNameMapper, transformIgnorePatterns, Dimensions/PixelRatio mocks).
- Replaced `metro-react-native-babel-preset` with `@react-native/babel-preset` in root and sample app.

### Added:

- Added `peerDependencies` declaration (`react-native: *`, `@amazon-devices/react-native-kepler: >=2.0.0`, `@amazon-devices/react-native-device-info: >=2.0.0`) for compatibility with both RN 0.72 and RN 0.83 consumers.
- Added `@react-native/babel-preset`, `react`, `react-native`, `@amazon-devices/react-native-kepler`, `@amazon-devices/react-native-device-info` to `devDependencies` for local development against RN 0.83.

### Fixed:

- Moved `@amazon-devices/react-native-kepler` and `@amazon-devices/react-native-device-info` from `dependencies` to `peerDependencies` to prevent duplicate package installations in consumer apps.

## [0.0.3-beta] - 2026/07/30
### Added:

- Add Japan (JP) region support for events, logs, and metrics endpoints.

## [0.0.2-beta] - 2025/10/24
### Initial release:

- Fix Security Vulnerability.

## [0.0.1-beta] - 2025/10/24
### Initial release:

- Capture JavaScript errors.
- Track HTTP requests, and responses.
- Promise rejection tracking.
- Capture system attributes.
- Record custom events and attributes.
- Record custom errors.
- Added sample app
