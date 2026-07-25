$ErrorActionPreference = "Stop"

$docsPath = Join-Path $PWD "docs"
$today = Get-Date -Format "yyyy-MM-dd"

if (-not (Test-Path $docsPath)) {
    throw "Docs folder not found: $docsPath"
}

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
$updatedFiles = 0
$skippedFiles = 0

Get-ChildItem -Path $docsPath -Recurse -Filter "*.md" -File | ForEach-Object {
    $file = $_
    $content = [System.IO.File]::ReadAllText($file.FullName)

    # Remove an optional UTF-8 BOM before checking the first characters.
    $normalizedContent = $content.TrimStart([char]0xFEFF)

    if ($normalizedContent.TrimStart().StartsWith("---")) {
        Write-Host "SKIP: $($file.FullName)" -ForegroundColor DarkGray
        $script:skippedFiles++
        return
    }

    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    if ($baseName -eq "README") {
        $parentName = $file.Directory.Name
        $title = ($parentName -replace "^\d+[-_ ]*", "") -replace "[-_]", " "
        $title = (Get-Culture).TextInfo.ToTitleCase($title.ToLower())
        $title = "$title Overview"
    }
    else {
        $title = ($baseName -replace "^\d+[-_ ]*", "") -replace "[-_]", " "
        $title = (Get-Culture).TextInfo.ToTitleCase($title.ToLower())
    }

    $relativePath = $file.FullName.Substring($docsPath.Length).TrimStart("\")
    $categoryFolder = $file.Directory.Name
    $category = ($categoryFolder -replace "^\d+[-_ ]*", "") -replace "[-_]", " "
    $category = (Get-Culture).TextInfo.ToTitleCase($category.ToLower())

    $frontmatter = @"
---
title: "$title"
documentType: Project Documentation
version: 1.0.0
status: Draft
owner: AVC Advertising Services
project: ANW AI-COS
created: $today
lastUpdated: $today
nextReview:
category: "$category"
tags:
  - documentation
dependencies: []
relatedDocuments: []
relatedADR: []
---

"@

    $newContent = $frontmatter + $normalizedContent.TrimStart()

    [System.IO.File]::WriteAllText(
        $file.FullName,
        $newContent,
        $utf8WithoutBom
    )

    Write-Host "UPDATED: $relativePath" -ForegroundColor Green
    $script:updatedFiles++
}

Write-Host ""
Write-Host "Frontmatter migration complete." -ForegroundColor Cyan
Write-Host "Updated files: $updatedFiles"
Write-Host "Skipped files: $skippedFiles"