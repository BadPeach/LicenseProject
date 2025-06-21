param(
    [Parameter(Mandatory)]
    [ValidateSet('analyzeCircuit','processVerilogFile')]
    [string]$Endpoint,

    [Parameter(Mandatory)]
    [int]$Vus,

    [Parameter(Mandatory)]
    [string]$Duration  # e.g. '20s'
)

# ─── CONFIG ────────────────────────────────────────────────────────────────────
$MonitorDuration = 25
$DurationSec     = [int]($Duration.TrimEnd('s'))

# ─── PATHS ──────────────────────────────────────────────────────────────────────
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ResultsDir = Join-Path $ScriptDir 'results'
if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir | Out-Null
}
$JsonPath = Join-Path $ResultsDir "results_aws_${Endpoint}_${Vus}vus_${Duration}.json"
$LogPath  = Join-Path $ResultsDir "dockerstats_aws_${Endpoint}_${Vus}vus_${Duration}.log"

# ─── PICK K6 SCRIPT ─────────────────────────────────────────────────────────────
switch ($Endpoint) {
    'analyzeCircuit'     { $K6Script = Join-Path $ScriptDir 'scripts\test_analyzeCircuit.js' }
    'processVerilogFile' { $K6Script = Join-Path $ScriptDir 'scripts\test_processVerilogFile.js' }
}

# ─── START DOCKER STATS MONITOR ─────────────────────────────────────────────────
Write-Host "Starting docker stats monitor for $MonitorDuration seconds..."
$monitorJob = Start-Job -ScriptBlock {
    param($LogFile, $DurationSeconds)
    do {
        docker stats --no-stream `
            --format "{{.Container}},{{.CPUPerc}},{{.MemUsage}},{{.NetIO}},{{.BlockIO}}" |
        Out-File -FilePath $LogFile -Append -Encoding utf8
        Start-Sleep -Seconds 1
    } while ((Get-Date) -lt ((Get-Date).AddSeconds($DurationSeconds)))
} -ArgumentList $LogPath, $MonitorDuration

# ─── RUN K6 TEST ────────────────────────────────────────────────────────────────
Write-Host "Running k6 against http://127.0.0.1:3001 with $Vus VUs for $Duration..."
$env:TARGET_HOST = 'http://127.0.0.1:3001'
$startTime = Get-Date
k6 run --vus $Vus --duration $Duration $K6Script --out json=$JsonPath
$elapsed = (Get-Date) - $startTime

# ─── WAIT FOR MONITOR TO FINISH ─────────────────────────────────────────────────
$remaining = $MonitorDuration - [int]$elapsed.TotalSeconds
if ($remaining -gt 0) {
    Write-Host "Test finished in $([int]$elapsed.TotalSeconds)s; waiting $remaining more seconds..."
    Start-Sleep -Seconds $remaining
}

# ─── STOP MONITOR ───────────────────────────────────────────────────────────────
if ($monitorJob) {
    Write-Host "Stopping monitor job..."
    Stop-Job   -Job $monitorJob -ErrorAction SilentlyContinue
    Receive-Job -Job $monitorJob | Out-Null
    Remove-Job  -Job $monitorJob
} else {
    Write-Host "No monitor job to stop."
}

# ─── DONE ───────────────────────────────────────────────────────────────────────
Write-Host "Done."
Write-Host "  k6 results JSON: $JsonPath"
Write-Host "  Docker stats log: $LogPath"
