# <img src=".github/gmail-logo.png" width="45"> Gmail Desktop

[![Travis](https://img.shields.io/travis/timche/gmail-desktop.svg?branch=master&maxAge=2592000&style=flat-square)](https://travis-ci.org/timche/gmail-desktop)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

> An unofficial Gmail Desktop App built with [Electron](https://github.com/electron/electron)

![Gmail Desktop Screenshot](.github/screenshot.png)

## Why?
If you like the simple interface of Gmail and aren't satisfied with any mail apps out there, then Gmail Desktop is the right app for you. It's just a wrapper around the Gmail website with some magic from Electron like native notifications or unread count badge in the dock.

## Features
- [x] Original Gmail Interface
- [x] Native Notifications
- [x] Unread Inbox Count (OS X only)
- [ ] Multiple Gmail Account

## Supported OS
- [x] OS X 10.9+
- [ ] Windows 7+
- [ ] Linux

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
