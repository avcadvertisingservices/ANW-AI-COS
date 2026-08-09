param(
  [Parameter(Mandatory = $true)]
  [string]$CommitMessage,

  [switch]$Execute
)

$ErrorActionPreference = "Stop"

$CliRoot = $PSScriptRoot
$RepoRoot = (
  git -C $CliRoot rev-parse --show-toplevel
).Trim()

if (-not $RepoRoot) {
  throw "Unable to determine the ANW repository root."
}

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

function Run-AnwCli {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  Push-Location $CliRoot

  try {
    & npx --no-install tsx src/cli.ts @Arguments

    if ($LASTEXITCODE -ne 0) {
      throw "ANW CLI command failed: $($Arguments -join ' ')"
    }
  }
  finally {
    Pop-Location
  }
}

function Get-CliVersion {
  $packagePath =
    Join-Path $CliRoot "package.json"

  $package =
    Get-Content $packagePath -Raw |
    ConvertFrom-Json

  return [string]$package.version
}

function Test-ReleaseTagExists {
  param(
    [string]$Version
  )

  $tag = "anw-cli-v$Version"

  $match =
    git -C $RepoRoot tag --list $tag

  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect Git release tags."
  }

  return (
    ($match | Out-String).Trim() -eq $tag
  )
}

function Get-WorkingTreeStatus {
  $status =
    git -C $RepoRoot status --porcelain

  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect Git working tree."
  }

  return @($status)
}

function Get-ChangedFiles {
  $files = @()

  $tracked =
    git -C $RepoRoot diff --name-only

  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect tracked changes."
  }

  $staged =
    git -C $RepoRoot diff --cached --name-only

  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect staged changes."
  }

  $files += $tracked
  $files += $staged

  return @(
    $files |
      Where-Object {
        $_ -and
        $_.Trim().Length -gt 0
      } |
      Sort-Object -Unique
  )
}

function Remove-DisposableFiles {
  $paths = @(
    (Join-Path $CliRoot "project-v*-base.txt"),
    (Join-Path $CliRoot "cli-v*-base.txt"),
    (Join-Path $CliRoot "package-v*-base.txt"),
    (Join-Path $RepoRoot "docs\before.json"),
    (Join-Path $RepoRoot "docs\after.json"),
    (Join-Path $RepoRoot "docs\comparison.json"),
    (Join-Path $RepoRoot "docs\comparison.md")
  )

  foreach ($path in $paths) {
    Remove-Item $path -Force -ErrorAction SilentlyContinue
  }
}

Write-Host ""
Write-Host "# ANW CLI Automated Release Cycle v2"
Write-Host ""

$branch = (
  git -C $RepoRoot branch --show-current
).Trim()

if (-not $branch) {
  throw "Unable to determine the current Git branch."
}

if ($branch -in @("main", "master")) {
  throw "Safety stop: automated releases cannot run from '$branch'."
}

Write-Host "Repository: $RepoRoot"
Write-Host "CLI Root:   $CliRoot"
Write-Host "Branch:     $branch"
Write-Host "Mode:       $(if ($Execute) { 'EXECUTE' } else { 'PREVIEW' })"

Remove-DisposableFiles

$initialVersion =
  Get-CliVersion

$initialTagExists =
  Test-ReleaseTagExists $initialVersion

$sourceChanges =
  Get-ChangedFiles

Write-Host ""
Write-Host "Current version: $initialVersion"
Write-Host "Current tag exists: $initialTagExists"

Write-Host ""
Write-Host "Source changes detected:"
if ($sourceChanges.Count -eq 0) {
  Write-Host "  none"
}
else {
  foreach ($file in $sourceChanges) {
    Write-Host "  $file"
  }
}

Run-Step "1/4 Tests" {
  Push-Location $CliRoot

  try {
    npm test
  }
  finally {
    Pop-Location
  }
}

Run-Step "2/4 Repository validation" {
  Run-AnwCli validate
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
  Write-Host "npm run release:auto -- `"$CommitMessage`""
  Write-Host ""
  exit 0
}

$currentVersion =
  Get-CliVersion

$currentTagExists =
  Test-ReleaseTagExists $currentVersion

# Resume-safe rule:
# - If the current version already has a release tag, this is a new cycle and we bump once.
# - If the current version does NOT have its release tag, we assume an earlier release
#   cycle already bumped this version and we resume without bumping again.
if ($currentTagExists) {
  Run-Step "3/4 Version bump and metadata sync" {
    Push-Location $CliRoot

    try {
      npm run release:next
    }
    finally {
      Pop-Location
    }
  }

  $currentVersion =
    Get-CliVersion

  if (
    Test-ReleaseTagExists $currentVersion
  ) {
    throw "Safety stop: release tag anw-cli-v$currentVersion already exists after version bump."
  }
}
else {
  Write-Host ""
  Write-Host "Resume mode detected."
  Write-Host "Version $currentVersion has no release tag."
  Write-Host "Skipping release:next to prevent an accidental double bump."
}

$releaseMetadataFiles = @(
  "tools/anw-cli/CHANGELOG.md",
  "tools/anw-cli/README.md",
  "tools/anw-cli/package-lock.json",
  "tools/anw-cli/package.json"
)

$filesToStage = @(
  $sourceChanges +
  $releaseMetadataFiles |
    Where-Object {
      $_ -and
      $_.Trim().Length -gt 0
    } |
    Sort-Object -Unique
)

Write-Host ""
Write-Host "Files to stage:"
foreach ($file in $filesToStage) {
  Write-Host "  $file"
}

foreach ($file in $filesToStage) {
  $absolutePath =
    Join-Path $RepoRoot $file

  if (Test-Path $absolutePath) {
    git -C $RepoRoot add -- $file

    if ($LASTEXITCODE -ne 0) {
      throw "Failed to stage $file."
    }
  }
}

$stagedFiles =
  git -C $RepoRoot diff --cached --name-only

if ($LASTEXITCODE -ne 0) {
  throw "Unable to inspect staged release files."
}

if ($stagedFiles) {
  Write-Host ""
  Write-Host "Staged release set:"
  $stagedFiles |
    ForEach-Object {
      Write-Host "  $_"
    }

  Run-Step "Commit release changes" {
    git -C $RepoRoot commit -m $CommitMessage
  }

  Run-Step "Push source branch" {
    git -C $RepoRoot push
  }
}
else {
  Write-Host ""
  Write-Host "No staged source changes remain."
  Write-Host "Continuing in release-resume mode."
}

$status =
  Get-WorkingTreeStatus

if ($status.Count -gt 0) {
  Write-Host ""
  $status |
    ForEach-Object {
      Write-Host $_
    }

  throw "Safety stop: working tree is not clean before release checks."
}

Run-Step "Release readiness check" {
  Run-AnwCli release --check
}

Run-Step "4/4 Controlled release" {
  Run-AnwCli release --execute --confirm
}

Write-Host ""
Write-Host "# ANW Automated Release Complete"
Write-Host ""
Write-Host "Version: $(Get-CliVersion)"
Write-Host "Tag:     anw-cli-v$(Get-CliVersion)"
Write-Host ""

git -C $RepoRoot status