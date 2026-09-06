---
paths:
  - "packages/app/**"
---

# Main process

- A `config.onDidChange("some.key", ...)` listener is registered once, at
  the manager or collection level as in `Accounts.init`, and iterates over
  the instances inside the handler. One per view or instance is N listeners
  for one key. See the `spellchecker.languages` listener in
  `packages/app/accounts.ts`.
  <!-- 2026-06-04, #568, with a feature; no incident recorded. -->
- When a `webContents` or emitter already has a listener for an event such
  as `did-navigate`, the new work joins that handler. Grep the file for the
  event on the same target first; name the merged handler after the event,
  `handleDidNavigate`, and call plain methods from it. Listeners attached
  and detached independently, `registerWindowedViewListeners` against
  `registerTabBroadcasts`, stay separate, because merging them breaks the
  detach.
  <!-- 2026-08-07: a pull request added a second did-navigate listener
  beside the existing passkey-challenge one. -->
- An accelerator that exists on every platform uses `CommandOrControl` and
  `Alt`; `Command` and `Option` are honored on macOS only, so a bare one is
  for a shortcut that is deliberately macOS-only.
  <!-- 2026-08-19, #882: a wrong modifier fails silently, the item just has
  no shortcut on Windows and Linux, and nothing in types, lint or tests
  catches it. -->
- Platform-specific behavior branches on `platform` from
  `@electron-toolkit/utils`, the main-process twin of the renderer's helper.
