# Knowledge Engine v1.1 — Supabase Persistence

## Step 1 — Copy the package

Extract the ZIP and copy these items into the root of `ANW-AI-COS`:

```text
src/
tests/
docs/
supabase/
.env.example
```

Choose **Yes** when Windows asks to merge folders.

## Step 2 — Update the Knowledge Engine index

Open:

```text
src/modules/knowledge/index.ts
```

Copy the exports from:

```text
src/modules/knowledge/index.ts.patch.txt
```

to the bottom of `index.ts`.

After copying, delete `index.ts.patch.txt`.

## Step 3 — Install packages

```powershell
npm install @supabase/supabase-js dotenv
```

```powershell
npm install -D supabase
```

## Step 4 — Protect secrets

Confirm `.gitignore` contains:

```text
.env
.env.local
.env.*.local
```

Never commit the real service-role key.

## Step 5 — Create your local environment file

Copy `.env.example` to `.env`:

```powershell
Copy-Item ".env.example" ".env"
```

Open `.env` and enter:

```text
SUPABASE_URL=your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=your server-only service-role key
```

Do not show this key in screenshots.

## Step 6 — Link your Supabase project

If Supabase CLI is not logged in:

```powershell
npx supabase login
```

Then link the repository:

```powershell
npx supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with the reference shown in your Supabase project URL.

## Step 7 — Apply the migration

```powershell
npx supabase db push
```

This creates `public.knowledge_entries`, indexes, validation constraints, and RLS protection.

## Step 8 — Register the live demo

```powershell
npm pkg set scripts.knowledge:supabase-demo="tsx src/modules/knowledge/supabase-demo.ts"
```

## Step 9 — Validate locally

```powershell
npm run typecheck
```

```powershell
npm test
```

## Step 10 — Run the Supabase demo

```powershell
npm run knowledge:supabase-demo
```

Expected result:

```text
CREATED or EXISTS: what-is-acoustic-neuroma
CREATED or EXISTS: one-sided-hearing-loss
CREATED or EXISTS: you-are-not-alone
hearingSearchCount: 1
topResult: One-Sided Hearing Loss
```

## Step 11 — Save the milestone

```powershell
git add .
git commit -m "feat: add Supabase persistence to knowledge engine"
git push origin HEAD:main
```

## Safety requirement

The service-role key bypasses normal RLS controls. Keep it only in secure server-side environments.
