# Changelog

This file is the draft of the next release, written one line at a time as work lands, in the section layout of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The version commit empties the section and its lines become the notes on the GitHub Release, so released versions are never listed here; see https://github.com/zoidsh/meru/releases for those.

## [Unreleased]

### Added

- Settings → Extensions lets you add sites where 1Password runs, such as your company's single sign-on provider, beside Google's sign-in pages

### Changed

- The 1Password extension's description in Settings → Extensions now says it needs the 1Password desktop app, and is no longer cut off after two lines
- The Show extensions button setting and the titlebar button it showed are gone: the 1Password popup that button opened isn't fully supported in Meru, and 1Password is meant to be used on the Google sign-in pages, through its inline menu and the prompts it shows there
- On Windows, Meru is now code-signed, so 1Password's Add Browser accepts it and Windows shows Meru's publisher instead of Unknown publisher
- On macOS 12 and earlier, this is the last version of Meru: it stops checking for updates there and gets no further fixes, security fixes included, so continued use on those Macs is at your own risk

### Fixed

- With Extend dark theme on, mail composed in Gmail no longer carries the dark theme's light text colors into drafts and sent messages, which made them unreadable in light-themed mail clients
- The 1Password setup steps in Settings → Extensions now point to Meru's install folder on Windows, `%LOCALAPPDATA%\Programs\Meru`, instead of `C:\Program Files`, where Meru isn't installed
- Help → Report Issue, Ask Question and Request Feature open a compose window that follows Extend dark theme and Close compose window after send
