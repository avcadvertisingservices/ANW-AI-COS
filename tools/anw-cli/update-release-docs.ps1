$ErrorActionPreference = "Stop"

$readmePath = Join-Path $PSScriptRoot "README.md"
$changelogPath = Join-Path $PSScriptRoot "CHANGELOG.md"

$version = "0.5.0"
$tag = "anw-cli-v0.5.0"
$date = "2026-08-08"

if (-not (Test-Path $readmePath)) {
    throw "README.md not found."
}

if (-not (Test-Path $changelogPath)) {
    throw "CHANGELOG.md not found."
}

# README
$readme = Get-Content $readmePath -Raw

$readme = $readme -replace '0\.4\.0', '0.5.0'
$readme = $readme -replace 'anw-cli-v0\.4\.0', 'anw-cli-v0.5.0'

if ($readme -notmatch '## `release`') {
    $releaseLines = @(
        "",
        "## ``release``",
        "",
        "Inspects ANW CLI release readiness without changing files.",
        "",
        "### Usage",
        "",
        '```powershell',
        "npm run dev -- release --check",
        '```',
        "",
        "### Release checks",
        "",
        "The command verifies:",
        "",
        '```text',
        "Git working tree clean",
        "CLI package version",
        "README release metadata",
        "CHANGELOG release metadata",
        "Release tag availability",
        "Full ANW validation",
        '```',
        "",
        "A successful release check confirms that the release candidate is ready.",
        "",
        "The command does not create commits, tags, pushes, or file changes.",
        ""
    )

    $releaseSection = $releaseLines -join "`r`n"

    if ($readme -match '(?m)^# Naming Rules') {
        $readme = $readme -replace '(?m)^# Naming Rules', ($releaseSection + "`r`n# Naming Rules")
    }
    else {
        $readme = $readme + $releaseSection
    }
}

if ($readme -notmatch '(?m)^release$') {
    $readme = $readme -replace '(?m)^validate\s*$', "validate`r`nrelease"
}

Set-Content -Path $readmePath -Value $readme -Encoding UTF8

Write-Host "README.md updated"

# CHANGELOG
$changelog = Get-Content $changelogPath -Raw

if ($changelog -notmatch '## \[0\.5\.0\]') {
    $newReleaseLines = @(
        "## [0.5.0] - $date",
        "",
        "### Added",
        "",
        "- Added the ``release`` command.",
        "- Added safe ``release --check`` mode.",
        "- Added Git working-tree cleanliness validation.",
        "- Added CLI package-version validation.",
        "- Added README release metadata validation.",
        "- Added CHANGELOG release metadata validation.",
        "- Added Git tag availability checks.",
        "- Added full ANW validation as part of release readiness.",
        "- Added fail-safe behavior that makes no commits, tags, pushes, or file changes.",
        "",
        "### Commands",
        "",
        "ANW CLI v0.5.0 includes:",
        "",
        '```text',
        "hello",
        "module",
        "component",
        "feature",
        "page",
        "doctor",
        "repair",
        "validate",
        "release",
        '```',
        "",
        "### Release readiness",
        "",
        "Run:",
        "",
        '```powershell',
        "npm run dev -- release --check",
        '```',
        "",
        "A release candidate must pass:",
        "",
        '```text',
        "Git working tree clean",
        "CLI package version",
        "README release metadata",
        "CHANGELOG release metadata",
        "Release tag available",
        "Full validation passed",
        '```',
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

    $newRelease = $newReleaseLines -join "`r`n"

    if ($changelog -match '(?m)^## \[0\.4\.0\]') {
        $changelog = $changelog -replace '(?m)^## \[0\.4\.0\]', ($newRelease + "`r`n## [0.4.0]")
    }
    else {
        $changelog = $newRelease + "`r`n" + $changelog
    }
}

Set-Content -Path $changelogPath -Value $changelog -Encoding UTF8

Write-Host "CHANGELOG.md updated"
Write-Host ""
Write-Host "Release documentation update complete."
Write-Host ""

git status