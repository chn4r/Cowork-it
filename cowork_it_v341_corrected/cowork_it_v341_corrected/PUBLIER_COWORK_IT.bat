@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js est requis. Installez Node.js 20 ou plus recent.
  pause
  exit /b 1
)
start "" http://127.0.0.1:4317/publish.html
npm run publish-ui
pause
