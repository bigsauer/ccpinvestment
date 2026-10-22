@echo off
rem ============================================================================
rem  Update the school IIS site to the latest code. One command, run on the SERVER.
rem
rem    1. Open Command Prompt AS ADMINISTRATOR  (Start, type cmd, right-click, Run as administrator)
rem    2. cd %USERPROFILE%\ccpinvestment
rem    3. scripts\update-iis.cmd
rem
rem  It pulls the latest code, builds it on Windows (Prisma needs a Windows build),
rem  stops the site's app pool, copies the new build over the live folder, starts the
rem  pool again, and checks /api/health. The live web.config and .env are NEVER touched.
rem
rem  Why .cmd and not .ps1: this server's policy blocks PowerShell scripts.
rem
rem  Database changes: if a release adds a new folder under prisma\migrations, run
rem  "npx prisma migrate deploy" once (from %USERPROFILE%\ccpinvestment) before this script.
rem ============================================================================
rem ---- settings: change only if the server layout changes ----------------------
set "REPO=%USERPROFILE%\ccpinvestment"
set "SITE_DIR=C:\inetpub\wwwroot\ccpinvestment"
set "SITE_NAME=Investmentclub"
set "URL=https://investmentclub.chaminade-stl.org"
rem ------------------------------------------------------------------------------

rem "git pull" can replace this very file while it runs, and cmd reads batch files line by
rem line, so run from a temporary copy. The single-line call + exit below is parsed whole,
rem so cmd never re-reads this (possibly replaced) file afterwards.
if defined UPDATE_IIS_CHILD goto :run
set "UPDATE_IIS_CHILD=1"
copy /Y "%~f0" "%TEMP%\update-iis-run.cmd" >nul
setlocal EnableDelayedExpansion
call "%TEMP%\update-iis-run.cmd" %* & exit /b !errorlevel!

:run
setlocal EnableExtensions DisableDelayedExpansion
set "APPCMD=%windir%\system32\inetsrv\appcmd.exe"
set "SRC=%REPO%\dist\iis"
set "POOL="

echo.
echo === Updating %SITE_NAME% from %REPO% ===

fltmc >nul 2>&1
if errorlevel 1 (
  echo.
  echo [X] Not running as Administrator. Close this window, then open Command Prompt with
  echo     "Run as administrator" and try again.
  exit /b 1
)

if not exist "%REPO%\package.json" (
  echo [X] Cannot find the project at %REPO%
  exit /b 1
)
if not exist "%REPO%\.env" (
  echo [X] %REPO%\.env is missing. The build needs DATABASE_URL, AUTH_SECRET and AUTH_URL in it.
  exit /b 1
)
if not exist "%SITE_DIR%\web.config" (
  echo [X] %SITE_DIR%\web.config is missing. Is SITE_DIR correct?
  exit /b 1
)

echo.
echo [1/6] Pulling the latest code...
git -C "%REPO%" pull --ff-only
if errorlevel 1 (
  echo [X] git pull failed. Nothing was changed on the live site.
  exit /b 1
)

cd /d "%REPO%"

echo.
echo [2/6] Installing dependencies (npm ci)...
call npm ci
if errorlevel 1 (
  echo [X] npm ci failed. Nothing was changed on the live site.
  exit /b 1
)

echo.
echo [3/6] Building for IIS (npm run build:iis)...
call npm run build:iis
if errorlevel 1 (
  echo [X] The build failed. Nothing was changed on the live site.
  exit /b 1
)
if not exist "%SRC%\server.js" (
  echo [X] The build did not produce %SRC%\server.js. Nothing was changed on the live site.
  exit /b 1
)

echo.
echo [4/6] Stopping the site's app pool...
for /f "usebackq delims=" %%P in (`%APPCMD% list app /site.name:%SITE_NAME% /text:applicationPool`) do set "POOL=%%P"
if "%POOL%"=="" (
  echo [X] Could not find the app pool for site "%SITE_NAME%". Run:  "%APPCMD%" list sites
  exit /b 1
)
echo      pool: %POOL%
"%APPCMD%" stop apppool /apppool.name:"%POOL%" >nul 2>&1

echo.
echo [5/6] Copying the new build over %SITE_DIR% ...
set "COPYFAIL="
robocopy "%SRC%\.next" "%SITE_DIR%\.next" /MIR /NFL /NDL /NP /NJH /NJS
if errorlevel 8 set "COPYFAIL=.next"
robocopy "%SRC%\node_modules" "%SITE_DIR%\node_modules" /MIR /NFL /NDL /NP /NJH /NJS
if errorlevel 8 set "COPYFAIL=%COPYFAIL% node_modules"
robocopy "%SRC%\public" "%SITE_DIR%\public" /MIR /NFL /NDL /NP /NJH /NJS
if errorlevel 8 set "COPYFAIL=%COPYFAIL% public"
copy /Y "%SRC%\server.js" "%SITE_DIR%\server.js" >nul
if errorlevel 1 set "COPYFAIL=%COPYFAIL% server.js"
copy /Y "%SRC%\package.json" "%SITE_DIR%\package.json" >nul
if errorlevel 1 set "COPYFAIL=%COPYFAIL% package.json"

echo.
echo [6/6] Starting the app pool again...
"%APPCMD%" start apppool /apppool.name:"%POOL%" >nul 2>&1
rem Touching web.config makes HttpPlatformHandler start a fresh Node process on the new files.
copy /b "%SITE_DIR%\web.config"+,, "%SITE_DIR%\web.config" >nul

if defined COPYFAIL (
  echo.
  echo [!] Some files could not be copied:%COPYFAIL%
  echo     The site may be in a mixed state. Fix the problem ^(usually a locked file^) and run this again.
  exit /b 1
)

echo.
echo Checking %URL%/api/health ...
where curl.exe >nul 2>&1
if errorlevel 1 (
  echo     curl.exe not found, so skipping the check. Open %URL%/api/health in a browser.
) else (
  curl.exe -s -S --max-time 40 "%URL%/api/health"
  echo.
)

echo.
echo === Done. Hard-refresh the site (Ctrl+F5). Expected health: {"ok":true,"db":"up"} ===
exit /b 0
