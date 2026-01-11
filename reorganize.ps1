# Reorganize Project - Separate Production and Development Files
$projectRoot = "d:\VMB activity\AIPlayground\5r assocaites comms UtoA"
Set-Location $projectRoot

Write-Host ""
Write-Host "Starting project reorganization..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Create new folder structure
Write-Host "Creating _development folder structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "_development" | Out-Null
New-Item -ItemType Directory -Force -Path "_development\test-scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "_development\docs" | Out-Null
New-Item -ItemType Directory -Force -Path "_development\temp" | Out-Null
New-Item -ItemType Directory -Force -Path "_development\data" | Out-Null
Write-Host "Folder structure created" -ForegroundColor Green
Write-Host ""

# Step 2: Move test scripts from backend/
Write-Host "Moving test scripts from backend..." -ForegroundColor Yellow
$testScripts = @(
    "test-api-eligible.js",
    "test-api-login.js",
    "test-db.js",
    "test-eligible.js",
    "test-endpoint-simple.js",
    "test-progress.js",
    "debug-login.js",
    "make-eligible.js",
    "reset-passwords.js",
    "setup-test-mode.js"
)

foreach ($script in $testScripts) {
    $source = "backend\$script"
    if (Test-Path $source) {
        Move-Item -Path $source -Destination "_development\test-scripts\" -Force
        Write-Host "   Moved $script" -ForegroundColor Gray
    }
}

# Move backend seed.js
if (Test-Path "backend\seed.js") {
    Move-Item -Path "backend\seed.js" -Destination "_development\test-scripts\backend-seed.js" -Force
    Write-Host "   Moved seed.js" -ForegroundColor Gray
}

Write-Host "Test scripts moved" -ForegroundColor Green
Write-Host ""

# Step 3: Move test docs from backend/
Write-Host "Moving documentation..." -ForegroundColor Yellow
if (Test-Path "backend\TEST_MODE_SUMMARY.md") {
    Move-Item -Path "backend\TEST_MODE_SUMMARY.md" -Destination "_development\docs\" -Force
    Write-Host "   Moved TEST_MODE_SUMMARY.md" -ForegroundColor Gray
}

# Step 4: Move seed from prisma/
if (Test-Path "prisma\seed.js") {
    Move-Item -Path "prisma\seed.js" -Destination "_development\test-scripts\prisma-seed.js" -Force
    Write-Host "   Moved prisma seed.js" -ForegroundColor Gray
}

# Step 5: Move docs from root
if (Test-Path "QUICK_START_TEST_MODE.md") {
    Move-Item -Path "QUICK_START_TEST_MODE.md" -Destination "_development\docs\" -Force
    Write-Host "   Moved QUICK_START_TEST_MODE.md" -ForegroundColor Gray
}
if (Test-Path "TEST_MODE_DOCUMENTATION.md") {
    Move-Item -Path "TEST_MODE_DOCUMENTATION.md" -Destination "_development\docs\" -Force
    Write-Host "   Moved TEST_MODE_DOCUMENTATION.md" -ForegroundColor Gray
}

Write-Host "Documentation moved" -ForegroundColor Green
Write-Host ""

# Step 6: Move data folders from root
Write-Host "Moving data folders..." -ForegroundColor Yellow

if (Test-Path "temp") {
    Move-Item -Path "temp" -Destination "_development\temp" -Force
    Write-Host "   Moved temp/" -ForegroundColor Gray
}

if (Test-Path "database") {
    New-Item -ItemType Directory -Force -Path "_development\data\database" | Out-Null
    Get-ChildItem -Path "database" | Move-Item -Destination "_development\data\database" -Force
    Remove-Item -Path "database" -Force
    Write-Host "   Moved database/" -ForegroundColor Gray
}

if (Test-Path "uploads") {
    New-Item -ItemType Directory -Force -Path "_development\data\uploads" | Out-Null
    Get-ChildItem -Path "uploads" -Recurse | Move-Item -Destination "_development\data\uploads" -Force
    Remove-Item -Path "uploads" -Recurse -Force
    Write-Host "   Moved uploads/" -ForegroundColor Gray
}

if (Test-Path "generated_pdfs") {
    New-Item -ItemType Directory -Force -Path "_development\data\generated_pdfs" | Out-Null
    Get-ChildItem -Path "generated_pdfs" -ErrorAction SilentlyContinue | Move-Item -Destination "_development\data\generated_pdfs" -Force
    Remove-Item -Path "generated_pdfs" -Force -ErrorAction SilentlyContinue
    Write-Host "   Moved generated_pdfs/" -ForegroundColor Gray
}

Write-Host "Data folders moved" -ForegroundColor Green
Write-Host ""

# Create placeholder directories in backend
Write-Host "Creating placeholder directories for production runtime..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "backend\uploads" | Out-Null
New-Item -ItemType File -Force -Path "backend\uploads\.gitkeep" | Out-Null
New-Item -ItemType Directory -Force -Path "uploads\progress" | Out-Null
New-Item -ItemType File -Force -Path "uploads\.gitkeep" | Out-Null
New-Item -ItemType Directory -Force -Path "generated_pdfs" | Out-Null
New-Item -ItemType File -Force -Path "generated_pdfs\.gitkeep" | Out-Null
Write-Host "Placeholder directories created" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Reorganization complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review moved files in _development/" -ForegroundColor White
Write-Host "2. Run 'npm run deploy-prep' to scan for production issues" -ForegroundColor White
Write-Host "3. Run 'npm run build-production' to create clean build" -ForegroundColor White
Write-Host ""
