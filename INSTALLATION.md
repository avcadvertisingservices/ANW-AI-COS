# ANW AI-COS Knowledge Engine v1.1 — Fixed Installation

This package fixes the Vitest error:

```text
No test suite found
```

The Knowledge Engine tests were already working. The failure came from three older empty placeholder files.

## Step 1 — Extract the ZIP

Extract this package.

## Step 2 — Copy into ANW-AI-COS

Copy these folders into the root of your `ANW-AI-COS` repository:

```text
scripts
tests
```

Choose **Yes** when Windows asks to merge folders.

## Step 3 — Run the safe cleanup

In the VS Code terminal, from the `ANW-AI-COS` root, run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/fix-empty-tests.ps1
```

The script checks only these three files:

```text
tests/environment.test.ts
tests/knowledge-service.test.ts
tests/knowledge-validation.test.ts
```

It removes a file only when it contains no `describe()`, `it()`, or `test()` suite.

Before removal, it creates a backup under:

```text
backups/empty-tests/
```

## Step 4 — Run all tests

```powershell
npm test
```

## Step 5 — Run the Knowledge Engine demo

```powershell
npm run knowledge:demo
```

## Step 6 — Save the fix

```powershell
git add .
git commit -m "fix: remove empty placeholder tests"
git push origin HEAD:main
```
