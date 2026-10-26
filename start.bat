@echo off
chcp 65001 >nul
title ASHAKids Platform Launcher

echo =====================================================================
echo                 ASHAKids - Iniciando Plataforma Local
echo =====================================================================
echo.

:: Verificar existencia de node y npm
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js no se encuentra instalado o no esta en el PATH.
    echo Por favor instala Node.js antes de continuar.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm no se encuentra disponible.
    pause
    exit /b 1
)

:: Directorio base
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/3] Levantando Backend Modular TypeScript (Puerto 8000)...
start "ASHAKids - Backend TS (Port 8000)" cmd /k "cd /d "%ROOT_DIR%backend" && npm run dev"

:: Breve espera para que el backend inicie primero
timeout /t 2 /nobreak >nul

echo [2/3] Levantando Frontend React + Vite (Puerto 5174)...
start "ASHAKids - Frontend (Port 5174)" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

:: Breve espera antes de abrir navegador
timeout /t 3 /nobreak >nul

echo [3/3] Abriendo navegador en la aplicacion local...
start http://127.0.0.1:5174

echo.
echo =====================================================================
echo                 ASHAKids esta corriendo correctamente
echo =====================================================================
echo   - Frontend:      http://127.0.0.1:5174
echo   - Backend API:   http://127.0.0.1:8000
echo   - Health Check:  http://127.0.0.1:8000/api/v1/health
echo.
echo   * Cada servicio se ha abierto en su propia ventana de consola.
echo   * Para detener los servicios, simplemente cierra sus ventanas correspondientes.
echo =====================================================================
echo.
pause
