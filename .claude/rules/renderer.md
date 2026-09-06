---
paths:
  - "packages/renderer/**"
  - "packages/ui/**"
---

# Renderer

- Components in `packages/ui` follow shadcn conventions, and many are
  compound: `Item` has `ItemContent`, `ItemActions`, `ItemTitle`,
  `ItemDescription`. Read the component file before using one and take the
  sub-components in place of plain `<div>` wrappers.
  <!-- 2026-04-18, #514, with a feature; no incident recorded. -->
- Classes shared across the branches of a conditional `className` are
  hoisted and merged with `cn` from `@meru/ui/lib/utils`:
  `cn("absolute hidden", isWide ? "size-5" : "size-4")`.
  <!-- 2026-08-03, #629, a docs-only pull request; no incident recorded. -->
- Keyboard keys in user-facing text render through `Kbd` from
  `@meru/ui/components/kbd`: `Hold <Kbd>Shift</Kbd> to …`.
  <!-- 2026-08-04, #640, a docs-only pull request; no incident recorded. -->
- Platform-specific copy, modifier keys, OS names, branches on the `platform`
  helper from `@/lib/utils`: `platform.isMacOS ? "Cmd" : "Ctrl"`.
  <!-- 2026-08-04, #639, a docs-only pull request; no incident recorded. -->
- Child `WebContentsView`s paint above the window's HTML, so a renderer-drawn
  overlay, a dropdown, tooltip or dialog, stays inside the regions the
  renderer owns, the titlebar and the vertical tabs: a vertical tabs menu
  opens with `side="top"` at anchor width. An overlay over view content is a
  native `Menu.popup` or a `Popup` from `packages/app/lib/popup.ts`.
  <!-- 2026-08-04, #648, a docs-only pull request; no incident recorded.
  The reason is Electron's compositing and still holds. -->
- A config-backed settings field is `ConfigSwitchField` for a boolean key
  and `ConfigSelectField` for a string-union key, both in
  `packages/renderer/components/`, never a hand-rolled `Field` plus control.
  Each checks its key's type at runtime, so the value type picks the
  component: a fixed set of named choices is a string union with
  `ConfigSelectField`, not a boolean with a switch.
  <!-- 2026-06-19, #573: the pull request's review turned a switch into a
  select for a two-choice setting. -->
- In a `ConfigSelectField`, the option matching the config default comes
  first in `items`, unless the options carry an order of their own: a scale
  keeps its order and the default falls where it does, as the hibernation
  timeouts run 30 minutes through 6 hours with `1h` second.
  <!-- 2026-08-19, #883: the old rule put the default first without
  exception, and #881's Hibernate After scale broke it. -->
- Truncated text, a tab title in the wide strip, sizes to what is rendered
  beside it in the current state, never to worst-case space for controls
  that appear on hover: `min-w-0 flex-1 truncate text-left` on the text and
  right-side content as flex siblings, so re-truncation on hover is expected.
  Hover-only padding, `group-hover:pr-*`, is only for a control that cannot
  join the flex flow, a close button overlaying a row that is itself a
  button.
  <!-- PR #660's tab strip, where worst-case space for the hover close
  button truncated titles early. -->
