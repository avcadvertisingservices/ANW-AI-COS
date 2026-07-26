$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "ANW AI-COS Test Cleanup" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Cyan

$projectRoot = (Get-Location).Path

$problemFiles = @(
    "tests/environment.test.ts",
    "tests/knowledge-service.test.ts",
    "tests/knowledge-validation.test.ts"
)

$removed = 0
$kept = 0

foreach ($relativePath in $problemFiles) {
    $fullPath = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $fullPath)) {
        Write-Host "NOT FOUND: $relativePath" -ForegroundColor DarkGray
        continue
    }

    $content = Get-Content -Path $fullPath -Raw

    $hasRealTest = (
        $content -match "\bdescribe\s*\(" -or
        $content -match "\bit\s*\(" -or
        $content -match "\btest\s*\("
    )

    if ($hasRealTest) {
        Write-Host "KEPT: $relativePath contains a real test suite." -ForegroundColor Yellow
        $kept++
        continue
    }

    $backupDirectory = Join-Path $projectRoot "backups/empty-tests"
    New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null

    $backupName = ($relativePath -replace "[\\/]", "__")
    $backupPath = Join-Path $backupDirectory $backupName

    Copy-Item -Path $fullPath -Destination $backupPath -Force
    Remove-Item -Path $fullPath -Force

    Write-Host "REMOVED EMPTY PLACEHOLDER: $relativePath" -ForegroundColor Green
    Write-Host "BACKUP: backups/empty-tests/$backupName" -ForegroundColor DarkGray
    $removed++
}

Write-Host ""
Write-Host "Cleanup complete." -ForegroundColor Cyan
Write-Host "Removed empty placeholders: $removed"
Write-Host "Kept real test files: $kept"
Write-Host ""
Write-Host "Now run: npm test" -ForegroundColor Cyan
