# ANW AI-COS Blueprint Generator v1.0

1. Extract this ZIP.
2. Copy the `scripts`, `src`, and `tests` folders into the root of your `ANW-AI-COS` repository. Choose **Yes** when Windows asks to merge folders.
3. In the VS Code terminal, run:

```powershell
npm install -D tsx vitest
npm pkg set scripts.blueprint:init="tsx scripts/blueprint-init.ts"
npm pkg set scripts.blueprint:demo="tsx src/modules/blueprint/demo.ts"
npm pkg set scripts.test="vitest run"
npm run blueprint:init
npm run typecheck
npm test
npm run blueprint:demo
```

The generator skips existing files and does not overwrite them.

Then save the milestone:

```powershell
git add .
git commit -m "feat: add blueprint generator module"
git push
```
