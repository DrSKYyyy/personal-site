@echo off
cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "deploy.ps1" %*
pause
