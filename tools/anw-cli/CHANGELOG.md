# Changelog

All notable changes to the ANW AI-COS CLI will be documented in this file.

---
## [0.15.0] - 2026-08-08

### Added

- Prepared ANW CLI version 0.15.0.
- Automated release version synchronization.

### Release

Git tag:

```text
anw-cli-v0.15.0
```

---

## [0.14.0] - 2026-08-08

### Added

- Prepared ANW CLI version 0.14.0.
- Automated release version synchronization.

### Release

Git tag:

```text
anw-cli-v0.14.0
```

---

## [0.13.0] - 2026-08-08

### Added

- Prepared ANW CLI version 0.13.0.
- Automated release version synchronization.

### Release

Git tag:

```text
anw-cli-v0.13.0
```

---

## [0.12.0] - 2026-08-08

### Added

- Prepared ANW CLI version 0.12.0.
- Automated release version synchronization.

### Release

Git tag:

```text
anw-cli-v0.12.0
```

---

## [0.11.0] - 2026-08-08

### Added

- Prepared ANW CLI version 0.11.0.
- Automated release version synchronization.

### Release

Git tag:

```text
anw-cli-v0.11.0
```

---

## [0.10.0] - 2026-08-08

### Added

- Prepared ANW CLI version 0.10.0.
- Automated release version synchronization.

### Release

Git tag:

```text
anw-cli-v0.10.0
```

---

## [0.8.0] - 2026-08-08

### Added

- Added controlled release execution with `release --execute`.
- Added mandatory `--confirm` protection for release execution.
- Added release blocking when the Git working tree is dirty.
- Added release blocking when README or CHANGELOG metadata does not match the package version.
- Added release blocking when the proposed Git tag already exists.
- Added full validation before tag creation.
- Added annotated Git tag creation.
- Added automatic push of only the release tag to `origin`.
- Added protection against automatic commits, branch merges, source-branch pushes, and force pushes.

### Controlled release

Run:

```powershell
npm run dev -- release --execute --confirm
```

The controlled release workflow performs:

```text
1. Confirm Git working tree is clean
2. Confirm CLI package version
3. Confirm README release metadata
4. Confirm CHANGELOG release metadata
5. Confirm release tag is available
6. Run full ANW validation
7. Create annotated Git tag
8. Push only the release tag to origin
```

### Safety

The release command does not:

```text
- create automatic commits
- merge branches
- push the source branch
- force push
- overwrite an existing release tag
```

### Release

Git tag:

```text
anw-cli-v0.8.0
```

---
## [0.8.0] - 2026-08-08

### Added

- Added `release --plan`.
- Added a safe preview of the ANW CLI release workflow.
- Added proposed Git release tag preview.
- Added proposed Git tag push command preview.
- Added protection against using `--check` and `--plan` together.
- Added explicit safety reporting confirming that release planning changes no files, commits, tags, or remotes.

### Release planning

Run:

```powershell
npm run dev -- release --plan
```

The command previews:

```text
1. Git working-tree check
2. CLI package-version check
3. README release metadata check
4. CHANGELOG release metadata check
5. Git tag availability check
6. Full ANW validation
7. Future annotated Git tag command
8. Future Git tag push command
```

The release plan is preview-only.

It does not:

```text
- modify files
- create commits
- create Git tags
- push to remotes
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
anw-cli-v0.6.0
```

---

## [0.6.0] - 2026-08-08

### Added

- Added `release --plan`.
- Added a safe preview of the ANW CLI release workflow.
- Added proposed Git release tag preview.
- Added proposed Git tag push command preview.
- Added protection against using `--check` and `--plan` together.
- Added explicit safety reporting for release planning.
- Release planning makes no file changes.
- Release planning creates no commits.
- Release planning creates no Git tags.
- Release planning performs no remote pushes.

### Release planning

Run:

```powershell
npm run dev -- release --plan
```

The command previews:

```text
1. Git working-tree check
2. CLI package-version check
3. README release metadata check
4. CHANGELOG release metadata check
5. Git tag availability check
6. Full ANW validation
7. Future annotated Git tag command
8. Future Git tag push command
```

No release actions are performed by --plan.

### Release readiness

Run:

```powershell
npm run dev -- release --check
```

The release check must confirm:

```text
Git working tree clean
CLI package version
README release metadata
CHANGELOG release metadata
Release tag availability
Full ANW validation
```

### Release

Git tag:

```text
anw-cli-v0.6.0
```

---

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

- Added the unified `validate` command.
- Added full CLI certification workflow.
- Added CLI TypeScript type-check validation.
- Added automated CLI test validation.
- Added CLI production build validation.
- Added repository Doctor integration.
- Added route repair dry-run integration.

### Validation workflow

Run:

```powershell
npm run dev -- validate
```

The validation command runs:

```text
1. CLI TypeScript type-check
2. CLI automated tests
3. CLI production build
4. ANW repository Doctor
5. ANW route repair dry-run
```

A successful validation ends with:

```text
5/5 certification steps passed.

Repository certification successful.
ANW AI-COS is ready for the next release step.
```

### Release

Git tag:

```text
anw-cli-v0.4.0
```

---

## [0.3.0]

### Added

- Added repository repair tooling.
- Added safe repair dry-run mode.
- Added `repair --write`.
- Added automatic repair for supported App Router problems.
- Added repair tests.
- Added protection against overwriting non-empty route files requiring manual review.

### Repair command

Dry run:

```powershell
npm run dev -- repair
```

Apply supported repairs:

```powershell
npm run dev -- repair --write
```

---

## [0.2.0]

### Added

- Added ANW repository Doctor.
- Added repository health inspection.
- Added App Router route-file checks.
- Added default export checks.
- Added error boundary `"use client"` checks.
- Added Git working-tree inspection.

### Doctor command

Run:

```powershell
npm run dev -- doctor
```

---

## [0.1.0]

### Added

- Initial ANW AI-COS CLI.
- Added `hello` command.
- Added module generator.
- Added component generator.
- Added feature generator.
- Added page generator.
- Added CLI configuration.
- Added automated generator tests.
- Added TypeScript build and type-check workflows.

### Initial commands

```text
hello
module
component
feature
page
```







