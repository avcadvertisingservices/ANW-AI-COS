# ANW AI-COS Carousel Production Engine v1.3.0

## What this release does

It converts a Content Engine carousel into a complete design-production package:

- 10 design-ready slide specifications
- Canva Bulk Create CSV
- Storyboard Markdown
- Image-generation prompts
- Per-slide copy files
- File naming conventions
- Quality checks
- Medical-review flags
- Supabase production tables

It does not auto-publish and does not directly call Canva yet.

## Step 1 — Copy the package

Extract the ZIP. Copy these folders into the root of `ANW-AI-COS`:

```text
src
tests
supabase
docs
```

Choose **Yes** when Windows asks to merge folders.

## Step 2 — Register scripts

```powershell
npm pkg set scripts.carousel:demo="tsx src/modules/carousel/demo.ts"
```

```powershell
npm pkg set scripts.carousel:integrated-demo="tsx src/modules/carousel/integrated-demo.ts"
```

## Step 3 — Validate the code

```powershell
npm run typecheck
```

```powershell
npm test
```

## Step 4 — Run the local demo

This demo does not use Supabase or paid AI credits:

```powershell
npm run carousel:demo
```

Expected output includes:

```text
slides: 10
aspectRatio: 9:16
canvas: 1080x1920
structuralValidation: true
readyForDesign: true
requiresHumanReview: true
errorCount: 0
```

Files are generated under:

```text
output/carousels/
```

## Step 5 — Run the integrated demo

This uses the existing approved Knowledge Engine records and the free mock Content Provider:

```powershell
npm run carousel:integrated-demo
```

## Step 6 — Apply the Supabase migration

```powershell
npx supabase db push
```

Approve this migration when prompted:

```text
202607270002_create_carousel_production_tables.sql
```

It creates:

```text
carousel_projects
carousel_slide_specs
```

## Step 7 — Security check

Confirm `output/` and `.env` are ignored:

```powershell
git check-ignore .env
```

```powershell
git check-ignore output
```

## Step 8 — Commit and release

```powershell
git add -A
```

```powershell
git --no-pager diff --cached --name-only
```

Confirm `.env` and `output/` are not staged.

```powershell
git commit -m "feat: add Carousel Production Engine v1"
```

```powershell
git push origin HEAD:main
```

```powershell
git tag -a v1.3.0 -m "Carousel Production Engine v1"
```

```powershell
git push origin v1.3.0
```
