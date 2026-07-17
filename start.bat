@echo off
cd /d "%~dp0"
title ZhiJing-Launcher

echo.
echo ========================================
echo   ZhiJing (知径) - Local Server
echo ========================================
echo.

for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo [clean] kill PID %%p
  taskkill /F /PID %%p >nul 2>&1
)
timeout /t 2 /nobreak >nul

set "PYEXE="
where py >nul 2>&1 && set "PYEXE=py -3"
if not defined PYEXE where python >nul 2>&1 && set "PYEXE=python"
if not defined PYEXE goto NO_PYTHON

echo [start] AI proxy - do NOT close the ZhiJing-AI-Proxy window
start "ZhiJing-AI-Proxy" /D "%~dp0" cmd /k %PYEXE% ai-proxy.py

echo [wait] waiting for proxy...
set RETRY=0
:WAIT_LOOP
timeout /t 1 /nobreak >nul
set /a RETRY+=1
curl -s -f http://localhost:3000/api/deepseek/health 2>nul | findstr /C:"proxy" >nul
if %errorlevel%==0 goto HEALTH_OK
if %RETRY% LSS 12 goto WAIT_LOOP

echo.
echo [error] AI proxy failed to start.
echo Check the ZhiJing-AI-Proxy window for details.
echo.
pause
exit /b 1

:HEALTH_OK
echo [ok] AI proxy is ready
echo.
echo   page:   http://localhost:3000/index.html
echo   health: http://localhost:3000/api/deepseek/health
echo.
start http://localhost:3000/index.html
pause
exit /b 0

:NO_PYTHON
echo [error] Python not found.
echo Install Python 3: https://www.python.org/downloads/
echo Check "Add Python to PATH" during install.
echo.
pause
exit /b 1
