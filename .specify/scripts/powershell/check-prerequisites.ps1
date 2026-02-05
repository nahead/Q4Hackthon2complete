# Check prerequisites for implementation
param(
    [switch]$Json,
    [switch]$RequireTasks,
    [switch]$IncludeTasks
)

$repoRoot = (Resolve-Path .).Path
$featureDir = Join-Path $repoRoot "specs/001-fullstack-todo-app"

# Check for available documents
$availableDocs = @()

if (Test-Path (Join-Path $featureDir "spec.md")) {
    $availableDocs += "spec.md"
}

if (Test-Path (Join-Path $featureDir "plan.md")) {
    $availableDocs += "plan.md"
}

if (Test-Path (Join-Path $featureDir "data-model.md")) {
    $availableDocs += "data-model.md"
}

if (Test-Path (Join-Path $featureDir "research.md")) {
    $availableDocs += "research.md"
}

if (Test-Path (Join-Path $featureDir "quickstart.md")) {
    $availableDocs += "quickstart.md"
}

if (Test-Path (Join-Path $featureDir "contracts")) {
    $availableDocs += "contracts/"
}

if (Test-Path (Join-Path $featureDir "tasks.md")) {
    $availableDocs += "tasks.md"
}

# Check if tasks.md exists when required
if ($RequireTasks -and -not (Test-Path (Join-Path $featureDir "tasks.md"))) {
    Write-Output "ERROR: tasks.md not found in $featureDir"
    Write-Output "Run /sp.tasks first to create the task list."
    exit 1
}

# Include tasks if requested and it exists
if ($IncludeTasks -and (Test-Path (Join-Path $featureDir "tasks.md"))) {
    $availableDocs += "tasks.md"
}

# Create result object
$result = @{
    FEATURE_DIR = $featureDir
    AVAILABLE_DOCS = $availableDocs
}

if ($Json) {
    $result | ConvertTo-Json
} else {
    Write-Output "FEATURE_DIR: $($result.FEATURE_DIR)"
    Write-Output "AVAILABLE_DOCS: $($result.AVAILABLE_DOCS -join ', ')"
}