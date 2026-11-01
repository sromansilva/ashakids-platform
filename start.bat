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

echo [1/4] Levantando Backend Modular TypeScript - Puerto 8000...
start "ASHAKids - Backend TS" cmd /k "cd /d %ROOT_DIR%backend && npm run dev"

:: Breve espera para que el backend inicie primero
ping 127.0.0.1 -n 3 >nul 2>nul

echo [2/4] Levantando Frontend React + Vite - Puerto 5174...
start "ASHAKids - Frontend" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

:: Verificar e iniciar microservicio ML en Python si existe
if not exist "%ROOT_DIR%ml-service\.venv\Scripts\python.exe" goto :no_ml
echo [3/4] Levantando Microservicio ML Fonetico Wav2Vec2 - Puerto 8001...
start "ASHAKids - ML Phonetic Service" cmd /k "cd /d %ROOT_DIR%ml-service && .venv\Scripts\python.exe -m uvicorn app:app --port 8001"
goto :ml_fin

:no_ml
echo [3/4] Microservicio ML no encontrado o sin entorno virtual. Modo simulacion activado.

:ml_fin
:: Breve espera antes de abrir navegador
ping 127.0.0.1 -n 4 >nul 2>nul

echo [4/4] Abriendo navegador en la aplicacion local...
start http://127.0.0.1:5174

echo.
echo =====================================================================
echo                 ASHAKids esta corriendo correctamente
echo =====================================================================
echo   - Frontend:      http://127.0.0.1:5174
echo   - Backend API:   http://127.0.0.1:8000
echo   - ML Service:    http://127.0.0.1:8001
echo   - Health Check:  http://127.0.0.1:8000/api/v1/health
echo.
echo   * Cada servicio se ha abierto en su propia ventana de consola.
echo   * Para detener los servicios, simplemente cierra sus ventanas correspondientes.
echo =====================================================================
echo.
pause
