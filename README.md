# <img src=".github/gmail-logo.png" width="45"> Gmail Desktop

[![Travis](https://travis-ci.org/timche/gmail-desktop.svg?branch=master)](https://travis-ci.org/timche/gmail-desktop) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> An unofficial Gmail Desktop App built with [Electron](https://github.com/electron/electron)

![Gmail Desktop Screenshot](.github/screenshot.png)

## Why?
If you are only using the Gmail website like me, then is this app just for you! It's just a wrapper around the Gmail website with some magic from Electron like native notifications or unread mails badge in the dock.

## Features
- [x] Original Gmail Interface
- [x] Native Notifications
- [x] Unread Inbox Count (OS X only)
- [ ] Multiple Gmail Accounts

## Supported OS
- [x] OS X 10.9+
- [ ] Windows 7+ (not tested yet)
- [ ] Linux (not tested yet)

## Installation

#### OS X
1. [Download latest release](https://github.com/timche/gmail-desktop/releases).
1. Unzip it.
1. Move `Gmail Desktop.app` to `/Applications`.

## Development
Gmail Desktop is built with [Electron](https://github.com/electron/electron).

#### Commands
- **Install npm dependencies:**

  ```bash
  $ npm install
  ```

- **Run the app:**

  ```bash
  $ npm start
  ```

- **Lint:**

  ```bash
  $ npm run lint
  ```

- **Build OS X:**

  ```bash
  $ npm run build:osx
  ```

- **Build all platforms:**

  ```bash
  $ npm run build
  ```

## To-Do
- [ ] Ability to use multiple Gmail accounts.
- [ ] Adjust OS X window buttons, so they don't overlay the Google Logo.
- [ ] Add Auto Updater.

## Contributing
Any contributions and suggestions are greatly appreciated! 🤗 🎉

## License
MIT © [Tim Cheung](https://github.com/timche)
