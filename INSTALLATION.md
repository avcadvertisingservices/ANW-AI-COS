# ANW AI-COS Knowledge Review Workflow v1.4.0

## What this release adds

- Knowledge review policy engine
- Draft, submit, in-review, changes-requested, approved, and rejected states
- Medical-reviewer authorization rules
- Source-count and source-URL validation
- Supabase review-request repository
- Immutable audit events
- Safe read-only topic diagnostic
- In-memory demo and automated tests

## Step 1 — Extract outside the repository

Extract this ZIP somewhere outside:

```text
C:\Users\LAPTOP\Documents\GitHub\ANW-AI-COS
```

Then copy only these folders into the repository root:

```text
src
tests
supabase
docs
```

Choose **Merge** when Windows asks.

Do not leave the extracted package folder inside the repository because Vitest may discover duplicate tests.

## Step 2 — Register scripts

```powershell
npm pkg set scripts.review:demo="tsx src/modules/review/demo.ts"
```

```powershell
npm pkg set scripts.review:check-topic="tsx src/modules/review/check-topic.ts"
```

## Step 3 — Validate locally

```powershell
npm run typecheck
```

```powershell
npm test
```

```powershell
npm run review:demo
```

Expected demo fields include:

```text
requestStatus: approved
knowledgeStatus: approved
requiresMedicalReviewer: true
sourceCount: 2
eventCount: 4
```

## Step 4 — Apply the Supabase migration

```powershell
npx supabase db push
```

Approve the migration when prompted:

```text
202607270002_create_knowledge_review_workflow.sql
```

## Step 5 — Inspect the real hearing-loss entry safely

```powershell
npm run review:check-topic
```

This is read-only. It prints policy failures without exposing your Supabase secret.

To inspect another slug temporarily:

```powershell
$env:REVIEW_TOPIC_SLUG="what-is-acoustic-neuroma"
npm run review:check-topic
Remove-Item Env:REVIEW_TOPIC_SLUG
```

## Step 6 — Release only after validation passes

```powershell
git status
git add -A
git --no-pager diff --cached --name-only
```

Confirm the staged list does not contain:

```text
.env
node_modules
output
supabase/.temp
```

Then:

```powershell
git commit -m "feat: add Knowledge Review Workflow v1.4.0"
git push origin HEAD:main
git tag -a v1.4.0 -m "Knowledge Review and Approval Workflow v1.4.0"
git push origin v1.4.0
```
