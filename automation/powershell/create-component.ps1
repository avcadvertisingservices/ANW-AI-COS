param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$ComponentName
)

$projectRoot = Resolve-Path (
    Join-Path $PSScriptRoot "..\.."
)

$componentsRoot = Join-Path `
    $projectRoot `
    "apps\admin\src\components"

if (!(Test-Path $componentsRoot)) {
    New-Item `
        -ItemType Directory `
        -Force `
        -Path $componentsRoot |
        Out-Null
}

$cleanName = $ComponentName.Trim()

if (
    $cleanName -notmatch
    "^[A-Za-z][A-Za-z0-9]*$"
) {
    Write-Host ""
    Write-Host `
        "Invalid component name: $ComponentName" `
        -ForegroundColor Red

    Write-Host `
        "Use PascalCase without spaces, for example: EvidenceCard" `
        -ForegroundColor Yellow

    exit 1
}

$componentPath = Join-Path `
    $componentsRoot `
    "$cleanName.tsx"

if (Test-Path $componentPath) {
    Write-Host ""
    Write-Host `
        "Component already exists:" `
        -ForegroundColor Yellow

    Write-Host $componentPath
    Write-Host ""
    Write-Host `
        "No files were overwritten." `
        -ForegroundColor Yellow

    exit 1
}

$componentCode = @"
type ${cleanName}Props = {
  className?: string;
};

export default function ${cleanName}({
  className = "",
}: ${cleanName}Props) {
  return (
    <section
      className={`rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176b52]">
        ANW AI-COS
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-900">
        ${cleanName}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Replace this placeholder with the component content.
      </p>
    </section>
  );
}
"@

Set-Content `
    -Path $componentPath `
    -Value $componentCode `
    -Encoding UTF8

Write-Host ""
Write-Host `
    "========================================" `
    -ForegroundColor Green

Write-Host `
    "ANW component created successfully!" `
    -ForegroundColor Green

Write-Host `
    "========================================" `
    -ForegroundColor Green

Write-Host ""
Write-Host "Component:"
Write-Host $componentPath
Write-Host ""