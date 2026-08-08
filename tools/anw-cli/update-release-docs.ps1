$ErrorActionPreference = "Stop"

$root = $PSScriptRoot

$packagePath = Join-Path $root "package.json"
$readmePath = Join-Path $root "README.md"
$changelogPath = Join-Path $root "CHANGELOG.md"

if (-not (Test-Path $packagePath)) {
    throw "package.json was not found."
}

if (-not (Test-Path $readmePath)) {
    throw "README.md was not found."
}

if (-not (Test-Path $changelogPath)) {
    throw "CHANGELOG.md was not found."
}

# ------------------------------------------------------------
# READ VERSION AUTOMATICALLY
# ------------------------------------------------------------

$package =
    Get-Content $packagePath -Raw |
    ConvertFrom-Json

$version = [string]$package.version
$tag = "anw-cli-v$version"
$date = Get-Date -Format "yyyy-MM-dd"

if ([string]::IsNullOrWhiteSpace($version)) {
    throw "Unable to read version from package.json."
}

Write-Host ""
Write-Host "ANW CLI Release Metadata Sync"
Write-Host "============================="
Write-Host ""
Write-Host "Version: $version"
Write-Host "Tag:     $tag"
Write-Host ""

# ------------------------------------------------------------
# README
# ------------------------------------------------------------

$readme =
    Get-Content $readmePath -Raw

# Replace current ANW CLI release tags.
$readme =
    [regex]::Replace(
        $readme,
        'anw-cli-v\d+\.\d+\.\d+',
        $tag
    )

# Replace standalone version line used by release metadata.
$readme =
    [regex]::Replace(
        $readme,
        '(?m)^\d+\.\d+\.\d+$',
        $version
    )

# Ensure current version and tag exist.
if ($readme -notmatch [regex]::Escape($version)) {
    $readme += "`r`n`r`nCurrent ANW CLI version: $version"
}

if ($readme -notmatch [regex]::Escape($tag)) {
    $readme += "`r`nRelease tag: $tag"
}

Set-Content `
    -Path $readmePath `
    -Value $readme `
    -Encoding UTF8

Write-Host "README.md synchronized."

# ------------------------------------------------------------
# CHANGELOG
# ------------------------------------------------------------

$changelog =
    Get-Content $changelogPath -Raw

$versionHeading =
    "## [$version]"

# Add a new release section only if this version does not exist.
if (
    $changelog -notmatch
    [regex]::Escape($versionHeading)
) {
    $releaseLines = @(
        "## [$version] - $date",
        "",
        "### Added",
        "",
        "- Prepared ANW CLI version $version.",
        "- Automated release version synchronization.",
        "",
        "### Release",
        "",
        "Git tag:",
        "",
        '```text',
        $tag,
        '```',
        "",
        "---",
        ""
    )

    $releaseSection =
        $releaseLines -join "`r`n"

    $firstRelease =
        [regex]::Match(
            $changelog,
            '(?m)^## \[\d+\.\d+\.\d+\]'
        )

    if ($firstRelease.Success) {
        $before =
            $changelog.Substring(
                0,
                $firstRelease.Index
            )

        $after =
            $changelog.Substring(
                $firstRelease.Index
            )

        $changelog =
            $before +
            $releaseSection +
            "`r`n" +
            $after
    }
    else {
        $changelog =
            $releaseSection +
            "`r`n" +
            $changelog
    }
}

Set-Content `
    -Path $changelogPath `
    -Value $changelog `
    -Encoding UTF8

Write-Host "CHANGELOG.md synchronized."

# ------------------------------------------------------------
# VERIFY
# ------------------------------------------------------------

$readmeCheck =
    Get-Content $readmePath -Raw

$changelogCheck =
    Get-Content $changelogPath -Raw

Write-Host ""
Write-Host "Verification"
Write-Host "------------"

if (
    $readmeCheck.Contains($version) -and
    $readmeCheck.Contains($tag)
) {
    Write-Host "PASS: README metadata"
}
else {
    Write-Host "FAIL: README metadata"
    exit 1
}

if (
    $changelogCheck.Contains(
        "## [$version]"
    ) -and
    $changelogCheck.Contains($tag)
) {
    Write-Host "PASS: CHANGELOG metadata"
}
else {
    Write-Host "FAIL: CHANGELOG metadata"
    exit 1
}

Write-Host ""
Write-Host "Release metadata synchronized successfully."
Write-Host ""
Write-Host "Version: $version"
Write-Host "Tag:     $tag"
Write-Host ""