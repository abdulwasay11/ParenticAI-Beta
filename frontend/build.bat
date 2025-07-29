@echo off
echo Building ParenticAI Frontend...

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build the application
echo Building static files...
call npm run build

echo Build complete! Static files are in the 'build' directory.
echo You can now serve these files with any static web server.
pause 