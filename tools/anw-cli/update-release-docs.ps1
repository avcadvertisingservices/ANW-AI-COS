$ErrorActionPreference = "Stop"

$readmePath = Join-Path $PSScriptRoot "README.md"
$changelogPath = Join-Path $PSScriptRoot "CHANGELOG.md"

$version = "0.6.0"
$tag = "anw-cli-v0.6.0"
$date = "2026-08-08"

Write-Host ""
Write-Host "ANW CLI Release Documentation Updater"
Write-Host "====================================="
Write-Host ""
Write-Host "Version: $version"
Write-Host "Tag:     $tag"
Write-Host ""

# ------------------------------------------------------------
# CHECK FILES
# ------------------------------------------------------------

if (-not (Test-Path $readmePath)) {
    throw "README.md was not found."
}

if (-not (Test-Path $changelogPath)) {
    throw "CHANGELOG.md was not found."
}

# ------------------------------------------------------------
# UPDATE README
# ------------------------------------------------------------

$readme = Get-Content $readmePath -Raw

# Update previous release version references.
$readme = $readme -replace '0\.5\.0', '0.6.0'
$readme = $readme -replace 'anw-cli-v0\.5\.0', 'anw-cli-v0.6.0'

# Add release plan documentation if it does not already exist.
if ($readme -notmatch 'release --plan') {

    $releasePlanSection = @(
        "",
        "## Release Planning",
        "",
        "ANW CLI supports a safe release preview mode.",
        "",
        "Run:",
        "",
        '```powershell',
        "npm run dev -- release --plan",
        '```',
        "",
        "The release plan previews:",
        "",
        '```text',
        "1. Git working-tree check",
        "2. CLI package-version check",
        "3. README release metadata check",
        "4. CHANGELOG release metadata check",
        "5. Git tag availability check",
        "6. Full ANW validation",
        "7. Future annotated Git tag command",
        "8. Future Git tag push command",
        '```',
        "",
        "The release plan makes no changes.",
        "",
        "It does not:",
        "",
        '```text',
        "- modify files",
        "- create commits",
        "- create Git tags",
        "- push to remotes",
        '```',
        ""
    )

    $releasePlanText = $releasePlanSection -join "`r`n"

    $readme = $readme + $releasePlanText
}

Set-Content `
    -Path $readmePath `
    -Value $readme `
    -Encoding UTF8

Write-Host "README.md updated for v0.6.0"

# ------------------------------------------------------------
# UPDATE CHANGELOG
# ------------------------------------------------------------

$changelog = Get-Content $changelogPath -Raw

# Only add the section once.
if ($changelog -notmatch '## \[0\.6\.0\]') {

    $releaseLines = @(
        "## [0.6.0] - $date",
        "",
        "### Added",
        "",
        "- Added ``release --plan``.",
        "- Added a safe preview of the ANW CLI release workflow.",
        "- Added proposed Git release tag preview.",
        "- Added proposed Git tag push command preview.",
        "- Added protection against using ``--check`` and ``--plan`` together.",
        "- Added explicit safety reporting for release planning.",
        "- Release planning makes no file changes.",
        "- Release planning creates no commits.",
        "- Release planning creates no Git tags.",
        "- Release planning performs no remote pushes.",
        "",
        "### Release planning",
        "",
        "Run:",
        "",
        '```powershell',
        "npm run dev -- release --plan",
        '```',
        "",
        "The command previews:",
        "",
        '```text',
        "1. Git working-tree check",
        "2. CLI package-version check",
        "3. README release metadata check",
        "4. CHANGELOG release metadata check",
        "5. Git tag availability check",
        "6. Full ANW validation",
        "7. Future annotated Git tag command",
        "8. Future Git tag push command",
        '```',
        "",
        "No release actions are performed by --plan.",
        "",
        "### Release readiness",
        "",
        "Run:",
        "",
        '```powershell',
        "npm run dev -- release --check",
        '```',
        "",
        "The release check must confirm:",
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

    $newRelease = $releaseLines -join "`r`n"

    # Put v0.6.0 immediately before v0.5.0 when possible.
    if ($changelog -match '(?m)^## \[0\.5\.0\]') {

        $changelog = $changelog -replace `
            '(?m)^## \[0\.5\.0\]', `
            ($newRelease + "`r`n## [0.5.0]")
    }
    else {

        # If the old heading cannot be found, prepend v0.6.0
        # while preserving all existing changelog content.
        $changelog = `
            $newRelease + "`r`n" + $changelog
    }
}

Set-Content `
    -Path $changelogPath `
    -Value $changelog `
    -Encoding UTF8

Write-Host "CHANGELOG.md updated for v0.6.0"

# ------------------------------------------------------------
# VERIFY METADATA
# ------------------------------------------------------------

Write-Host ""
Write-Host "Checking release metadata..."
Write-Host ""

$readmeCheck = Get-Content $readmePath -Raw
$changelogCheck = Get-Content $changelogPath -Raw

if (
    $readmeCheck -match '0\.6\.0' -and
    $readmeCheck -match 'anw-cli-v0\.6\.0'
) {
    Write-Host "PASS: README release metadata"
}
else {
    Write-Host "FAIL: README release metadata"
}

if (
    $changelogCheck -match '## \[0\.6\.0\]' -and
    $changelogCheck -match 'anw-cli-v0\.6\.0'
) {
    Write-Host "PASS: CHANGELOG release metadata"
}
else {
    Write-Host "FAIL: CHANGELOG release metadata"
}

Write-Host ""
Write-Host "Release documentation update complete."
Write-Host ""

git status