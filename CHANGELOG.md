# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.1]

### Fixed

- Linux/Windows: Tray icon is now loaded correctly

## [2.3.0]

### Added

- Add debug mode option
- Add paste and match style to edit menu

### Changed

- Updated to Typescript

## [2.2.0]

### Changed

- Update location of report issue link
- Default window size to maximized on initial start

### Fixed

- macOS: App is now signed and auto-update working properly

## [2.1.1]

### Fixed

- Fixed bounds issue for initial startup after 2.1.0 update

## [2.1.0]

### Added

- Persist window size between app restarts

### Changed

- Remove `electron-is-dev` package
- Rename MailTo to Mailto

### Fixed

- Fix inconsistent unread count

## [2.0.0] - 2019-02-11

### Added

- Add auto-updater
- Add taskbar support on Windows/Linux

### Changed

- Upgrade electron to v4
- Update README

### Fixed

- Fixed notification onclick

## [1.0.1] - 2017-10-18

### Fixed

- Fixed regular expression for single-digit unread counts

## [1.0.0] - 2017-08-10

### Changed

- Upgrade Electron to v1.7.5
- Remove babel-core

## [0.3.0] - 2016-11-22

### Added

- Add mailto support

### Fixed

- Fix for , in Window title
- Disabled nodeIntegration to fix jQuery

## [0.2.1] - 2016-06-10

### Fixed

- Fix add account opening in a new window

## [0.2.0] - 2016-05-15

### Changed

- Upgrade electron to ^1.0.2
- Switch to eslint and eslint-config-airbnb-base

### Fixed

- Fix switching accounts opening in new blank window

## 0.1.0 - 2016-04-29

- Initial release

[unreleased]: https://github.com/timche/gmail-desktop/compare/v2.3.1...HEAD
[2.3.1]: https://github.com/timche/gmail-desktop/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/timche/gmail-desktop/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/timche/gmail-desktop/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/timche/gmail-desktop/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/timche/gmail-desktop/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/timche/gmail-desktop/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/timche/gmail-desktop/compare/v1.0.0...v1.0.1
[1.0.1]: https://github.com/timche/gmail-desktop/compare/v1.0.0...v1.0.1
[1.0.1]: https://github.com/timche/gmail-desktop/compare/v1.0.0...v1.0.1
[1.0.1]: https://github.com/timche/gmail-desktop/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/timche/gmail-desktop/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/timche/gmail-desktop/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/timche/gmail-desktop/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/timche/gmail-desktop/compare/v0.1.0...v0.2.0
