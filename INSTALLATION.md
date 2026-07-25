# Sprint 06 Installation

## 1. Copy files

Extract the ZIP and copy its contents into the root of the local `ANW-AI-COS` repository.

This pack adds:
- `src/modules/knowledge`
- `database/knowledge`
- knowledge tests
- sprint documentation

## 2. Add a demo script

Run:

```powershell
npm pkg set scripts.knowledge:demo="tsx src/modules/knowledge/demo.ts"
```

Your existing test command should already be:

```text
tsx --test tests/**/*.test.ts
```

## 3. Validate

Run one command at a time:

```powershell
npm run typecheck
npm test
npm run knowledge:demo
```

## Expected demo result

The terminal should print JSON containing:

```json
{
  "module": "knowledge",
  "resultCount": 1
}
```

## 4. Commit after tests pass

```powershell
git status
git add .
git commit -m "feat: add Sprint 06 knowledge engine"
git push origin main
```
