# Start LangGraph + AutoGen sidecars for academAI
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) { throw "Python not found. Install Python 3.10+ first." }

Write-Host "Installing Python orchestrator deps..."
& python -m pip install -q -r requirements.txt

Write-Host "Starting LangGraph on :8001 and AutoGen on :8002..."
$lang = Start-Process python -ArgumentList "langgraph_server.py" -PassThru -WindowStyle Hidden
$auto = Start-Process python -ArgumentList "autogen_server.py" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 2
Write-Host "LangGraph PID $($lang.Id) | AutoGen PID $($auto.Id)"
Write-Host "Health: http://localhost:8001/health | http://localhost:8002/health"
