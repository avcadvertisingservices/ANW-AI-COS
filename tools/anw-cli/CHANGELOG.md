# Changelog

All notable changes to the ANW AI-COS CLI are documented in this file.

The format follows the principles of Keep a Changelog, and the project uses semantic versioning.

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