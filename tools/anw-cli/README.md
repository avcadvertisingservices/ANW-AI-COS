# ANW AI-COS CLI

Developer command-line tools for the **Acoustic Neuroma Warrior AI Content Operating System**.

The ANW CLI helps developers create consistent modules, components, pages, and complete features while protecting existing files and following the ANW project structure.

> You Are Not Alone.

---

## Current Version

```text
0.5.0
```

Git tag:

```text
anw-cli-v0.5.0
```
## `repair`

...all the repair documentation here...

The command never overwrites a non-empty route file just because it lacks a default export.

Those files are reported as:

```text
Manual review required
```

### Recommended workflow

```powershell
npm run dev -- repair
git diff

npm run dev -- repair --write
npm run typecheck
npm test
npm run dev -- doctor
```

## `validate`

Runs the complete ANW CLI certification workflow in one command.

### Usage

```powershell
npm run dev -- validate
```

### Validation steps

The command runs:

```text
1. CLI TypeScript type-check
2. CLI automated tests
3. CLI production build
4. ANW repository Doctor
5. ANW route repair dry-run
```

A successful validation ends with:

```text
âœ“ 5/5 certification steps passed.

Repository certification successful.
ANW AI-COS is ready for the next release step.
```

The validation process stops immediately if any certification step fails.


## `release`

Inspects ANW CLI release readiness without changing files.

### Usage

```powershell
npm run dev -- release --check
```

### Release checks

The command verifies:

```text
Git working tree clean
CLI package version
README release metadata
CHANGELOG release metadata
Release tag availability
Full ANW validation
```

A successful release check confirms that the release candidate is ready.

The command does not create commits, tags, pushes, or file changes.

# Naming Rules

...the rest of your existing README continues here...
