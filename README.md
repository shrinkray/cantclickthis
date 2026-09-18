# cantclickthis.dev

Live demo site for the talk *The 80/20 of Accessibility — Small Fixes, Big Impact*
(Greg Miller, Shrinkray Interactive). Static Astro site, six interactive
fail/fix accessibility comparisons, a hero track with a transcript, and a screen-reader
buffer panel for the room to watch live.

## Requirements

- Node ≥ 22
- [Corepack](https://nodejs.org/api/corepack.html) (ships with Node) — this
  repo pins its package manager via `packageManager` in `package.json`, so
  running any `pnpm` command in this directory automatically uses the pinned
  version. You don't need to install pnpm globally.

## Setup

```bash
corepack enable        # once per machine
pnpm install
pnpm run dev            # http://localhost:4321
```

**Use `pnpm`, not `npm` or `yarn`, in this repo.** It's the only lockfile
committed (`pnpm-lock.yaml`) and the only one CI/hosting will read.

### Scripts

| Command | Does |
| :-- | :-- |
| `pnpm run dev` | Local dev server |
| `pnpm run build` | Static build to `dist/` |
| `pnpm run preview` | Serve the built `dist/` locally |

The hero audio is for the talk, not a timed karaoke demo. The transcript under
the player is the accessible alternative (WCAG 1.2.1).

## Security posture (pnpm-workspace.yaml)

This repo blocks install (`postinstall`) scripts by default and only allows
them for packages that are known to need one, and only after Astro's
five-minute-fresh-release cooldown has passed. See `pnpm-workspace.yaml` for
the full config and comments. If `pnpm install` fails with something like:

> This candidate release is younger than the configured `minimumReleaseAge`

**that is the cooldown working as intended.** Wait, don't lower or disable
`minimumReleaseAge` to get unblocked.

If `pnpm install` fails on a build script from a *new* dependency you just
added, add it to `allowBuilds` in `pnpm-workspace.yaml` first (name-only is
fine) — that's `strictDepBuilds` doing its job, not a broken install.

### ⚠️ Known vulnerability — astro 5.x, action needed separately

`pnpm audit` currently reports 13 findings against `astro@5.18.2`, the most
severe a **critical** remote-code-execution advisory in AVIF image
optimization, patched only at `astro >= 7.2.8`. This predates the pnpm
migration — it was already the resolved version under the old npm lockfile —
pnpm's audit step simply surfaced it.

**This has deliberately not been fixed as part of switching package
managers.** `package.json` currently pins `"astro": "^5.0.0"`; the fix is a
two-major-version bump (5 → 7), which is a framework upgrade, not a
package-manager swap, and belongs in its own reviewable change. Do that
next, separately, and re-run `pnpm audit --audit-level moderate` after.

## Deploying (Cloudflare Pages)

Cloudflare Pages' build image ignores `packageManager` and Corepack — it
detects the package manager from which lockfile is present, and needs its
pnpm version set explicitly via an environment variable.

In the Pages project settings:

- **Build command:** `pnpm run build`
- **Build output directory:** `dist`
- **Environment variable** (set for both **Production** and **Preview**):
  `PNPM_VERSION` = `11.21.0`

Validate any config change against a **Preview deploy** before merging —
Pages builds on Linux, so a local build on a different OS doesn't prove the
native dependencies (`sharp`, `esbuild`) resolve there.

## If you're the next Dependabot / automated PR

Bumps should land in `pnpm-lock.yaml` only. If a tool resurrects
`package-lock.json`, this repo's package manager is pnpm — close that PR
manually or add a `.github/dependabot.yml` pinning
`package-ecosystem: "npm"` cleanly through pnpm's npm-compatible mode.
