# Git Rules

This is the canonical git rules document for the Structured Chaos family of projects. All child repos read from this file. Per-repo scope lists and versioning-mechanic details live in each repo's own `AGENTS.md`.

- All projects use [Conventional Commits](https://www.conventionalcommits.org/) to drive automatic versioning and changelog generation.
- Commit everything that is dirty unless specified otherwise.
- Use more than one commit if needed across multiple files.
- List commit messages for review before running git command:

```
git commit
```

- Do not commit before being asked to do so.

## Commit Message Format

```
<type>(<scope>): <description>

<optional body>
```

- The **type** is mandatory and determines the version bump.
- The **scope** is optional but encouraged for clarity (e.g. `css`, `deploy`, `sketch`).
  - Avoid scopes that are too broad (e.g. just `cms` for the Craft site).
- The **description** should be lowercase, imperative, and concise.
- The **body** is optional but encouraged unless it causes duplication of the description.
  - Bullet points are preferred.

### Footers

Avoid adding non-functional footers such as `Generated with [Devin](https://devin.ai)` or `Co-Authored-By: Devin ...` to commit messages. These are not part of the project's conventional commit format and add noise to the changelog.

Functional footers are allowed only when they carry meaning for the project:

- `BREAKING CHANGE:` to signal a breaking change
- `Signed-off-by:` if the project requires DCO sign-off

## Commit Types and Version Impact

| Type                                  | Version bump | Changelog group                  |
|---------------------------------------|-------------|----------------------------------|
| `feat`                                | **minor** (e.g. 1.3.0 → 1.4.0) | Features                         |
| `fix`                                 | **patch** (e.g. 1.3.0 → 1.3.1) | Fixes                            |
| `docs`                                | none (revision only) | Documentation                    |
| `refactor`                            | none (revision only) | Refactors                        |
| `test`                                | none (revision only) | Tests                            |
| `chore`                               | none (revision only) | Maintenance                      |
| `style` / `ui`                        | none (revision only) | Styling / UI (no logic change)   |
| any + `BREAKING CHANGE` footer or `!` | **major** (e.g. 1.3.0 → 2.0.0) | Breaking changes                 |

> Note: individual repos may use `style` (KnitStitch) or `ui` (CraftCms) for the no-logic-change styling type. Use whichever the repo's history already follows.

Commits that don't match a known type (anything not `feat`, `fix`, or breaking) increment the **revision** — the fourth version number (e.g. 1.3.0.1, 1.3.0.2). The revision resets to 0 whenever a `feat`, `fix`, or breaking change is encountered.

## Breaking Changes

To signal a breaking change, either:

- Add `BREAKING CHANGE:` in the commit body footer, or
- Add `!` after the type/scope: `feat(api)!: redesign endpoint structure`

## Examples

```
feat(tag): add post tags filter to archive sidebar
fix(css): correct card image aspect ratio on mobile
docs(readme): update deployment instructions
refactor(ui): split bootstrap and UI wiring
test(fields): add post field layout coverage
chore(build): regenerate build info for v1.17.0
style: update app styles and index.html
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: v1 endpoints are no longer available.
```

## Versioning Mechanics

Versioning is handled per-repo by that repo's build-info generator, which reads git tags and the conventional commit log to derive a version. The generator entry point differs by stack:

- **CraftCms** — `scripts/GenerateBuildInfo.php`, run via `composer build-info` (also runs automatically via `composer install` `post-install-cmd`). Outputs Twig partials under `templates/_generated/`.
- **KnitStitch** — `scripts/generate-build-info.mjs`, run via `npm run build-info` (generates `src/buildInfo.js` + `CHANGELOG.md`) or `npm run build-changelog`.
- **StructuredChaos** — static site, no build-info generator; follow the same commit format for consistency.

In all cases the generator:

1. Reads all git tags matching `vX.Y.Z` and uses the latest tag as the starting version.
2. Walks the commit log (oldest first) from the last tagged commit.
3. Bumps the version per the rules above for each commit.
4. Outputs the resolved version and changelog in the repo's chosen format.

If no tags exist, the version starts at `v1.0.0`.

## Tagging

Tags are optional but should be created at release milestones:

```
git tag v1.4.0
git push origin v1.4.0
```

A tag pins the version at that point. All commits after the tag will increment from the tagged version.

## Scopes

Scopes are **project-specific** — see each repo's `AGENTS.md` for the common scopes used in that project. Scopes are not enforced; use whatever best describes the area of change.
