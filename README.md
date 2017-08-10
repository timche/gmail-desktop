# <img src=".github/gmail-logo.png" width="45"> Gmail Desktop

[![Travis](https://travis-ci.org/timche/gmail-desktop.svg?branch=master)](https://travis-ci.org/timche/gmail-desktop) [![XO Code Style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo) [![Styled with Prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> Gmail Desktop App built with [Electron](https://github.com/electron/electron)

![Gmail Desktop Screenshot](.github/screenshot.png)

## Features

- Original Gmail Interface
- Native Notifications
- Unread Inbox Count (macOS only)

## Installation

*Only macOS 10.9+ is currently supported.*

#### macOS

1. [Download latest release](https://github.com/timche/gmail-desktop/releases) (`Gmail-Desktop-macOS-X.X.X.zip`).
1. Unzip it.
1. Move `Gmail Desktop.app` to `/Applications`.

## Developing

Built with [Electron](https://github.com/electron/electron).

#### Install

```sh
npm install
```

#### Run

```sh
npm start
```

#### Build

```sh
# All platforms
npm run build

# macOS
npm run build:macos
```

## To-Do

- [ ] Ability to use multiple Gmail accounts
- [ ] Add Auto Updater

## Contributing

Any contributions and suggestions are highly appreciated! 🤗 🎉
