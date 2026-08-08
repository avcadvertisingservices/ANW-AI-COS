# ANW AI-COS CLI

Developer command-line tools for the **Acoustic Neuroma Warrior AI Content Operating System**.

The ANW CLI helps developers create consistent modules, components, pages, and complete features while protecting existing files and following the ANW project structure.

> You Are Not Alone.

---

## Current Version

```text
0.8.0
```

Git tag:

```text
anw-cli-v0.15.0
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

## Release Planning

ANW CLI supports a safe release preview mode.

Run:

```powershell
npm run dev -- release --plan
```

The release plan previews:

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

The release plan makes no changes.

It does not:

```text
- modify files
- create commits
- create Git tags
- push to remotes
```









