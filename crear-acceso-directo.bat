@echo off
echo ===================================================
echo  Creando acceso directo para Sistema de Objetivos
echo ===================================================
echo.

echo Creando acceso directo con el icono moderno...
echo.

:: Obtener la ruta completa del directorio actual
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

:: Crear archivo VBS temporal para generar el acceso directo
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateShortcut.vbs"
echo sLinkFile = "%USERPROFILE%\Desktop\Sistema de Objetivos.lnk" >> "%TEMP%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateShortcut.vbs"
echo oLink.TargetPath = "%CURRENT_DIR%\index.html" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "%CURRENT_DIR%" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Description = "Sistema de Objetivos - Version 2.0.0" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.IconLocation = "%CURRENT_DIR%\app-icon-modern.ico" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"

:: Ejecutar el script VBS
cscript //nologo "%TEMP%\CreateShortcut.vbs"

:: Eliminar el archivo VBS temporal
del "%TEMP%\CreateShortcut.vbs"

echo.
echo Acceso directo creado exitosamente en el escritorio con el icono moderno.
echo.
pause
