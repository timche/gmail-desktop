# Meru

The code is public here. The board and the docs are in the private sibling
`zoidsh/meru-internal`, checked out at `~/meru-internal`, docs under its
`docs/`, and a pull request here closes `zoidsh/meru-internal#<n>`. Read
`docs/architecture.md` there before touching `packages/app`: it carries the
process model, the startup order and the invariants a change must keep.

Setup is `bun install --frozen-lockfile`. Lefthook formats and lint-fixes the
staged files at every commit.

## Checks

- **Fast**, in the edit loop: `bun run lint && bun run types`.
- **Task**, before the pull request: `bun run fmt:check`, `bun run lint`,
  `bun run types` and `bun test`. Each is a CI job, so a task check that
  passes here is green there.
- **Full**, in CI: the task checks plus `bun run test:e2e` on macOS, Windows
  and Linux, which builds the app and launches it. Here the same run is
  `xvfb-run -a bun run test:e2e`, since the sandbox has no display and the
  suite fails on the display before it reaches the app; it reads the license
  key from `.env.test.local`, which every worktree carries.
  `MERU_SKIP_BUILD=1` reruns against the build already in `dist`.
  `bun run test:perf` measures memory, CPU and bundle size against the same
  build, run the same way.
  <!-- 2026-08-25, with the perf project: the display note came with the
  suites; no incident recorded. -->

## Boundaries

On top of the global never tier.

- **Always** `bun add -d`. Rolldown and Vite bundle everything at build time,
  and electron-builder ships anything under `dependencies` a second time; the
  one exception is a native module Electron loads at runtime, which goes in
  `dependencies` so electron-builder packages it.
  <!-- 2026-04-20, #520, with a feature; no incident recorded. The reason
  is electron-builder's packaging and still holds: `dependencies` is
  empty today. -->
- **Always** land a style change through `@timche/oxc-configs`, checked out
  at `~/oxc-configs` and extended by `oxlint.config.ts`, as a rule: the code
  converts once the rule is on, and a feature pull request carries no style
  sweep. New code matches the neighboring function until then.
  <!-- 2026-08-18: asked why one function used .then() like its neighbor,
  the answer was a lint rule in the shared package, not a rewrite. -->
- **Ask first** before an Electron or electron-builder bump: the end-to-end
  job builds unsigned, so signing and installer packaging run for the first
  time in the release itself, and a bump is a release risk Tim weighs.
- **Ask first** before a config migration in
  `packages/app/lib/config-migrations.ts`. Every migration guards every key it
  reads and branches on a legacy key, never on a value equal to a default;
  the docs decision of 2026-09-04 says why.
  <!-- 2026-09-04: the 3.60 migration read a key without a guard and bricked
  every fresh install of the first beta; nothing but a release build ran it. -->
- **Ask first** before a change to `tests/memory-budget.json` or
  `tests/bundle-budget.json`: a budget moves only when the issue asks for it.
- **Ask first** before a change to licensing, the trial or Pro gating,
  `licenseKey`, validate and the settings behind them: it is a paid product's
  fence and every plan decision spans both repositories.
- **Never** bump the version, tag or cut a release: a release is Tim's word
  through the `release` skill, and an updater ships whatever is tagged.
- **Never** put the license key from `.env.test.local` in a commit, a comment
  or a pull request.

## Practices

- Time and duration values come from `ms` in `@meru/shared/ms`, never the
  `ms` package: `import { ms } from "@meru/shared/ms"; ms("1d")`.
  <!-- 2026-04-20, #515, with a feature; no incident recorded. -->
- A writing-style pass leaves marketing and identity copy alone: taglines,
  product descriptions, the README header, the `description` in
  `package.json`. Positioning copy is a product decision; raise a line that
  breaks a rule as a question instead of editing it.
  <!-- PR #868: a tagline rewrite and a README header cleanup were both
  reverted mid-pass. -->
- A macOS-only behavior, accelerators, menus, signing, cannot be verified on
  this Linux sandbox: do what can be done, and say so under `## Not verified`.

Rules for the renderer and for the main process load from `.claude/rules/`
when those files are read.
