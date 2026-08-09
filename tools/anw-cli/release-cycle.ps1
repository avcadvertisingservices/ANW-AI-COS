param(
  [Parameter(Mandatory = $true)]
  [string]$CommitMessage,

  [switch]$Execute
)

$ErrorActionPreference = "Stop"

function Run-Step {
  param(
    [string]$Title,
    [scriptblock]$Action
  )

  Write-Host ""
  Write-Host "========================================"
  Write-Host $Title
  Write-Host "========================================"
  & $Action

  if ($LASTEXITCODE -ne 0) {
    throw "$Title failed with exit code $LASTEXITCODE."
  }
}

function Get-ChangedFiles {
  $files = @()

  $tracked = git diff --name-only
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect tracked changes."
  }

  $staged = git diff --cached --name-only
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect staged changes."
  }

  $files += $tracked
  $files += $staged

  return @(
    $files |
      Where-Object { $_ -and $_.Trim().Length -gt 0 } |
      Sort-Object -Unique
  )
}

Write-Host ""
Write-Host "# ANW CLI Automated Release Cycle"
Write-Host ""

$branch = (git branch --show-current).Trim()

if (-not $branch) {
  throw "Unable to determine the current Git branch."
}

if ($branch -in @("main", "master")) {
  throw "Safety stop: automated releases cannot run from '$branch'."
}

Write-Host "Branch: $branch"
Write-Host "Mode:   $(if ($Execute) { 'EXECUTE' } else { 'PREVIEW' })"

# Remove only known disposable local release-test files.
$cleanupCandidates = @(
  "project-v*-base.txt",
  "cli-v*-base.txt",
  "..\..\docs\before.json",
  "..\..\docs\after.json",
  "..\..\docs\comparison.json",
  "..\..\docs\comparison.md"
)

foreach ($candidate in $cleanupCandidates) {
  Remove-Item $candidate -Force -ErrorAction SilentlyContinue
}

$sourceChanges = Get-ChangedFiles

Write-Host ""
Write-Host "Source changes detected before version bump:"
if ($sourceChanges.Count -eq 0) {
  Write-Host "  none"
} else {
  foreach ($file in $sourceChanges) {
    Write-Host "  $file"
  }
}

Run-Step "1/4 Tests" {
  npm test
}

Run-Step "2/4 Repository validation" {
  npm run dev -- validate
}

if (-not $Execute) {
  Write-Host ""
  Write-Host "# Preview Complete"
  Write-Host ""
  Write-Host "Tests and validation passed."
  Write-Host "No version bump, commit, push, or release was performed."
  Write-Host ""
  Write-Host "Run again with -Execute when ready:"
  Write-Host ""
  Write-Host "powershell -ExecutionPolicy Bypass -File .\release-cycle.ps1 -CommitMessage `"$CommitMessage`" -Execute"
  Write-Host ""
  exit 0
}

Run-Step "3/4 Version bump and metadata sync" {
  npm run release:next
}

$releaseFiles = @(
  "CHANGELOG.md",
  "README.md",
  "package-lock.json",
  "package.json"
)

$filesToStage = @(
  $sourceChanges + $releaseFiles |
    Where-Object { $_ -and $_.Trim().Length -gt 0 } |
    Sort-Object -Unique
)

Write-Host ""
Write-Host "Files to stage:"
foreach ($file in $filesToStage) {
  Write-Host "  $file"
}

foreach ($file in $filesToStage) {
  if (Test-Path $file) {
    git add -- $file
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to stage $file."
    }
  }
}

$stagedFiles = git diff --cached --name-only
if ($LASTEXITCODE -ne 0) {
  throw "Unable to inspect staged release files."
}

if (-not $stagedFiles) {
  throw "No staged files found after the release bump."
}

Write-Host ""
Write-Host "Staged release set:"
$stagedFiles | ForEach-Object { Write-Host "  $_" }

Run-Step "Commit release changes" {
  git commit -m $CommitMessage
}

Run-Step "Push source branch" {
  git push
}

$status = git status --porcelain
if ($LASTEXITCODE -ne 0) {
  throw "Unable to inspect Git status."
}

if ($status) {
  Write-Host ""
  Write-Host $status
  throw "Safety stop: working tree is not clean after push."
}

Run-Step "Release readiness check" {
  npm run dev -- release --check
}

Run-Step "4/4 Controlled release" {
  npm run dev -- release --execute --confirm
}

Write-Host ""
Write-Host "# ANW Automated Release Complete"
Write-Host ""
npm run dev -- --version
git status