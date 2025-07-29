@echo off
echo Serving ParenticAI Frontend Static Files...

REM Check if build directory exists
if not exist "build" (
    echo Build directory not found. Building first...
    call build.bat
)

REM Check if npx is available
npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Serving static files on http://localhost:3000
    npx serve -s build -l 3000
) else (
    echo npx not found. Installing serve globally...
    npm install -g serve
    echo Serving static files on http://localhost:3000
    serve -s build -l 3000
) 