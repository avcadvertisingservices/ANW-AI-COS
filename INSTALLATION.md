# AI Content Engine v1.0 Installation

## 1. Copy files
Extract this ZIP. Copy `src`, `tests`, `supabase`, and `docs` into the root of `ANW-AI-COS`. Choose **Yes** to merge folders.

## 2. Install packages
```powershell
npm install openai zod
```

## 3. Register commands
```powershell
npm pkg set scripts.content:demo="tsx src/modules/content/demo.ts"
npm pkg set scripts.content:live-demo="tsx src/modules/content/live-demo.ts"
```

## 4. Confirm `.gitignore`
```text
.env
.env.local
.env.*.local
node_modules/
dist/
coverage/
output/
supabase/.temp/
```

## 5. Validate without OpenAI charges
```powershell
npm run typecheck
npm test
npm run content:demo
```
Expected: `carouselSlides: 10`, all format flags `true`, and `missionPresent: true`.

## 6. Apply database migration
```powershell
npx supabase db push
```

## 7. Optional live OpenAI generation
Add only to your local `.env`:
```text
OPENAI_API_KEY=your_private_openai_api_key
OPENAI_MODEL=gpt-5.6
```
Never show or commit the API key. Then run:
```powershell
npm run content:live-demo
```
The bundle is saved under `output/`.

## 8. Commit after tests pass
```powershell
git add .
git status
git commit -m "feat: add AI Content Engine v1"
git push origin HEAD:main
```
Confirm `.env`, `node_modules`, `output`, and `supabase/.temp` are not staged.
