# <img src="media/logo.png" height="38"> Gmail Desktop

[![Travis](https://travis-ci.org/timche/gmail-desktop.svg?branch=master)](https://travis-ci.org/timche/gmail-desktop)
[![Latest Tag](https://img.shields.io/github/tag/timche/gmail-desktop.svg?style=flat)](https://github.com/timche/gmail-desktop/releases/latest)
[![XO Code Style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![Styled with Prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=popout)](#contributors)

> Gmail Desktop App built with [Electron](https://github.com/electron/electron)

![Gmail Desktop Screenshot](media/screenshot.png)

## Highlights

- Native Gmail interface
- Cross-platform
- Desktop notifications
- Unread badge in macOS dock & icon Windows/Linux tray
- Silent auto-updates
- [Appearance customizations](#appearance-customizations)
- [Custom styles](#custom-styles)

## Installation

_macOS 10.10+, Linux and Windows 7+ are supported._

#### macOS

[**Download**](https://github.com/timche/gmail-desktop/releases/latest) the latest `.dmg` file.

#### Linux

[**Download**](https://github.com/timche/gmail-desktop/releases/latest) the latest `.AppImage` or `.deb` file.

#### Windows

[**Download**](https://github.com/timche/gmail-desktop/releases/latest) the latest `.exe` file.

## Features

### Appearance Customizations

Gmail Desktop provides a number of appearance customizations to improve and simplify the default Gmail styles. These customizations are listed under the `Settings` → `Appearance` menu.

- Compact Header - Customizes the Gmail header to use a more compact style to provide a more native feel. This setting requires a restart to be applied.
- Hide Footer - Hides footer information text (storage used, terms links, etc.).
- Hide Right Sidebar - Hides the Google apps sidebar on the right side of the interface.
- Hide Support - Hides the support button in the header.

### Custom styles

In addition to the available appearance customizations, users can add additional custom styles. Click the menu item `Settings` → `Appearance` → `Custom Styles` to open the custom css file in the default editor for CSS files.

## Developing

Built with [Electron](https://github.com/electron/electron).

#### Install

```sh
yarn install
```

#### Run

```sh
yarn start
```

#### Build

```sh
yarn dist
```

## Maintainers

- [Tim Cheung](https://github.com/timche)
- [Mark Skelton](https://github.com/markypython)

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="http://www.ramin.it"><img src="https://avatars1.githubusercontent.com/u/672932?v=4" width="100px;" alt="Ramin Banihashemi"/><br /><sub><b>Ramin Banihashemi</b></sub></a><br /><a href="https://github.com/timche/gmail-desktop/commits?author=bsramin" title="Code">💻</a> <a href="#ideas-bsramin" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/cdloh"><img src="https://avatars3.githubusercontent.com/u/883577?v=4" width="100px;" alt="Callum Loh"/><br /><sub><b>Callum Loh</b></sub></a><br /><a href="https://github.com/timche/gmail-desktop/commits?author=cdloh" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/herrevilkitten"><img src="https://avatars0.githubusercontent.com/u/4753104?v=4" width="100px;" alt="herrevilkitten"/><br /><sub><b>herrevilkitten</b></sub></a><br /><a href="https://github.com/timche/gmail-desktop/commits?author=herrevilkitten" title="Code">💻</a></td>
    <td align="center"><a href="https://zhuzilin.github.io/"><img src="https://avatars0.githubusercontent.com/u/10428324?v=4" width="100px;" alt="Zilin Zhu"/><br /><sub><b>Zilin Zhu</b></sub></a><br /><a href="https://github.com/timche/gmail-desktop/commits?author=zhuzilin" title="Code">💻</a></td>
    <td align="center"><a href="https://volution.ro/ciprian"><img src="https://avatars0.githubusercontent.com/u/29785?v=4" width="100px;" alt="Ciprian Dorin Craciun"/><br /><sub><b>Ciprian Dorin Craciun</b></sub></a><br /><a href="#ideas-cipriancraciun" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/cyfrost"><img src="https://avatars3.githubusercontent.com/u/12471103?v=4" width="100px;" alt="Cyrus Frost"/><br /><sub><b>Cyrus Frost</b></sub></a><br /><a href="https://github.com/timche/gmail-desktop/commits?author=cyfrost" title="Code">💻</a> <a href="#maintenance-cyfrost" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Disclaimer

Gmail Desktop is a third-party app and not affiliated with Google.
