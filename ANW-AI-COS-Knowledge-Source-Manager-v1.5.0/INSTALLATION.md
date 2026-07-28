# ANW AI-COS v1.5.0 — Knowledge Source Manager

## Important

Extract this ZIP outside the repository. Copy only the listed folders into `ANW-AI-COS`. Do not leave the extracted package folder inside the repository because Vitest will discover duplicate tests.

## Step 1 — Copy folders

Copy these folders into the repository root:

```text
src/
tests/
supabase/
docs/
```

Choose **Merge** or **Replace files** when Windows asks.

## Step 2 — Register scripts

```powershell
npm pkg set scripts.source:demo="tsx src/modules/source/demo.ts"
npm pkg set scripts.source:check-topic="tsx src/modules/source/check-topic.ts"
npm pkg set scripts.source:add="tsx src/modules/source/add-source.ts"
npm pkg set scripts.source:update="tsx src/modules/source/update-source.ts"
npm pkg set scripts.source:remove="tsx src/modules/source/remove-source.ts"
```

## Step 3 — Validate locally

```powershell
npm run typecheck
npm test
npm run source:demo
```

Expected demo highlights:

```text
entryStatus: draft
sourceCount: 2
validSourceCount: 2
collectionValid: true
firstMutationResetReview: true
reviewedByCleared: true
eventCount: 2
```

The warning count is expected because the demo intentionally uses reserved `example.org` fixture URLs. Never use those fixture URLs as medical sources.

## Step 4 — Apply the audit migration

Check the migration sequence first:

```powershell
npx supabase migration list
npx supabase db push --dry-run
```

The pending migration should be:

```text
202607270004_create_knowledge_source_events.sql
```

Then apply it:

```powershell
npx supabase db push
```

Type `Y` when asked.

## Step 5 — Inspect the real topic

```powershell
npm run source:check-topic
```

By default, this checks `one-sided-hearing-loss`. To check another topic:

```powershell
$env:SOURCE_TOPIC_SLUG="what-is-acoustic-neuroma"
npm run source:check-topic
Remove-Item Env:SOURCE_TOPIC_SLUG
```

## Step 6 — Add one real source

Use values from a real, verified source. Do not paste API keys into these variables.

```powershell
$env:SOURCE_TOPIC_SLUG="one-sided-hearing-loss"
$env:SOURCE_TITLE="PUT THE REAL SOURCE TITLE HERE"
$env:SOURCE_PUBLISHER="PUT THE REAL PUBLISHER HERE"
$env:SOURCE_URL="https://PUT-THE-REAL-SOURCE-URL-HERE"
$env:SOURCE_EVIDENCE_LEVEL="educational"
$env:SOURCE_ACTOR_NAME="ANW Editorial Team"
$env:SOURCE_ACTOR_ROLE="editorial_reviewer"
$env:SOURCE_NOTES="Added for evidence review."
npm run source:add
```

Clear the temporary values afterward:

```powershell
Remove-Item Env:SOURCE_TOPIC_SLUG -ErrorAction SilentlyContinue
Remove-Item Env:SOURCE_TITLE -ErrorAction SilentlyContinue
Remove-Item Env:SOURCE_PUBLISHER -ErrorAction SilentlyContinue
Remove-Item Env:SOURCE_URL -ErrorAction SilentlyContinue
Remove-Item Env:SOURCE_EVIDENCE_LEVEL -ErrorAction SilentlyContinue
Remove-Item Env:SOURCE_ACTOR_NAME -ErrorAction SilentlyContinue
Remove-Item Env:SOURCE_ACTOR_ROLE -ErrorAction SilentlyContinue
Remove-Item Env:SOURCE_NOTES -ErrorAction SilentlyContinue
```

Add the second verified source in the same way, then run:

```powershell
npm run source:check-topic
npm run review:check-topic
```

Adding or changing a source on approved content intentionally resets the entry to `draft` and clears the previous approval. The entry must pass review again.

## Step 7 — Git release

Only after typecheck, tests, demo, migration, and topic check succeed:

```powershell
git status
git add -A
git --no-pager diff --cached --name-only
```

Confirm `.env`, `node_modules`, `output`, and `supabase/.temp` are not staged.

```powershell
git commit -m "feat: add Knowledge Source Manager"
git push origin HEAD:main
git tag -a v1.5.0 -m "Knowledge Source Manager"
git push origin v1.5.0
```
