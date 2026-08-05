param(
    [Parameter(Mandatory = $true)]
    [string]$ModuleName
)

$root = "src/modules/$ModuleName"

Write-Host ""
Write-Host "Creating module: $ModuleName"
Write-Host ""

$folders = @(
    "$root",
    "$root/docs",
    "$root/tests"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

$files = @(
    "README.md",
    "index.ts",
    "types.ts",
    "repository.ts",
    "service.ts",
    "validation.ts",
    "loader.ts",
    "factory.ts",
    "demo.ts"
)

foreach ($file in $files) {

    $path = Join-Path $root $file

    if (!(Test-Path $path)) {

        New-Item -ItemType File -Path $path | Out-Null

    }

}

Write-Host ""
Write-Host "Module created successfully!"
Write-Host ""
Write-Host $root