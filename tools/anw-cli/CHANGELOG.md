# Changelog

All notable changes to the ANW AI-COS CLI are documented in this file.

The format follows the principles of Keep a Changelog, and the project uses semantic versioning.

## [0.6.0] - 2026-08-08

### Added

- Added `release --plan`.
- Added a safe release workflow preview.
- Added proposed Git tag preview.
- Added proposed Git push command preview.
- Added explicit safety reporting confirming that no files, commits, tags, or remotes are changed by release planning.

### Release planning

Run:

```powershell
npm run dev -- release --plan

## [0.5.0] - 2026-08-08

### Added

- Added the `release` command.
- Added safe `release --check` mode.
- Added Git working-tree cleanliness validation.
- Added CLI package-version validation.
- Added README release metadata validation.
- Added CHANGELOG release metadata validation.
- Added Git tag availability checks.
- Added full ANW validation as part of release readiness.
- Added fail-safe behavior that makes no commits, tags, pushes, or file changes.

### Commands

ANW CLI v0.5.0 includes:

```text
hello
module
component
feature
page
doctor
repair
validate
release
```

### Release readiness

Run:

```powershell
npm run dev -- release --check
```

A release candidate must pass:

```text
Git working tree clean
CLI package version
README release metadata
CHANGELOG release metadata
Release tag available
Full validation passed
```

### Release

Git tag:

```text
anw-cli-v0.5.0
```

---

## [0.4.0] - 2026-08-08

### Added

- Added the `validate` command.
- Added one-command ANW CLI certification.
- Added automated TypeScript type-check execution.
- Added automated CLI test execution.
- Added automated production build execution.
- Added automated Doctor execution.
- Added automated route repair dry-run execution.
- Added fail-fast certification behavior.
- Added Windows-compatible npm process execution.

### Commands

ANW CLI v0.4.0 includes:

```text
hello
module
component
feature
page
doctor
repair
validate
```

### Certification

The full certification workflow can now be run with:

```powershell
npm run dev -- validate
```

Successful certification requires:

```text
âœ“ CLI TypeScript type-check
âœ“ CLI automated tests
âœ“ CLI production build
âœ“ ANW repository Doctor
âœ“ ANW route repair dry-run
```

### Release

Git tag:

```text
anw-cli-v0.4.0
```

---

## [0.3.0] - 2026-08-07

### Added

- Added the `repair` command for Next.js App Router recovery.
- Added safe dry-run mode as the default behavior.
- Added `--write` mode for applying approved automatic repairs.
- Added detection and replacement of empty `page.tsx` files.
- Added detection and replacement of empty `layout.tsx` files.
- Added detection and replacement of empty `loading.tsx` files.
- Added detection and replacement of empty `error.tsx` files.
- Added automatic `"use client"` insertion for error boundaries.
- Added manual-review protection for non-empty route files without default exports.
- Added automated tests for dry-run and write modes.
- Added tests confirming healthy files remain unchanged.
- Added tests confirming manual-review files are never overwritten.

### Commands

ANW CLI v0.3.0 includes:

```text
hello
module
component
feature
page
doctor
repair
```

### Certification

Version 0.3.0 was certified using:

```powershell
npm run typecheck
npm test
npm run build
npm run dev -- doctor
npm run dev -- repair
```

### Release

Git tag:

```text
anw-cli-v0.3.0
```

---

## [0.2.0] - 2026-08-06

### Added

- Added the `module` generator for ANW domain modules.
- Added the `component` generator for branded admin React components.
- Added the `page` generator for Next.js App Router pages.
- Added the `feature` generator for complete ANW feature foundations.
- Added the `doctor` command for repository health checks.
- Added automated generator and Doctor tests.
- Added existing-file protection for generated files.
- Added `--force` support for generator commands.
- Added nested route support to the page generator.
- Added generated `loading.tsx` and `error.tsx` route files.
- Added automatic `"use client"` directives to generated error boundaries.
- Added Git working-tree inspection to the Doctor.
- Added App Router file validation.
- Added route default-export validation.
- Added empty route-file detection.
- Added client error-boundary validation.
- Added Windows-compatible Git execution.
- Added strict TypeScript compilation.
- Added compiled output in the `dist` directory.

### Commands

ANW CLI v0.2.0 includes:

```text
hello
module
component
feature
page
doctor

