# Instrucciones para subir el proyecto a GitHub

Sigue estos pasos para subir tu proyecto "Reporte de ventas" a GitHub:

## 1. Crear un nuevo repositorio en GitHub

1. Ve a [GitHub](https://github.com/) y asegúrate de iniciar sesión
2. Haz clic en el botón "+" en la esquina superior derecha y selecciona "New repository"
3. Nombra el repositorio como "Reporte-de-ventas"
4. Añade una descripción: "Sistema de reporte de ventas y seguimiento de objetivos"
5. Deja el repositorio como público (o privado si prefieres)
6. No inicialices el repositorio con un README, .gitignore o licencia, ya que ya tenemos nuestros archivos
7. Haz clic en "Create repository"

## 2. Conectar tu repositorio local con el remoto

Una vez creado el repositorio, GitHub te mostrará instrucciones. Abre una terminal en la carpeta de tu proyecto y ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/Reporte-de-ventas.git
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

## 3. Subir tu código al repositorio remoto

```bash
git push -u origin master
```

Si estás usando la rama principal como "main" en lugar de "master", usa:

```bash
git push -u origin main
```

## 4. Verificar que todo se haya subido correctamente

1. Ve a la URL de tu repositorio en GitHub: `https://github.com/TU_USUARIO/Reporte-de-ventas`
2. Deberías ver todos tus archivos y carpetas en la interfaz web de GitHub

## Nota importante

Si GitHub te pide credenciales, tendrás que usar tu nombre de usuario y un token de acceso personal en lugar de tu contraseña. Puedes crear un token en:

1. Ve a Configuración (Settings) en tu perfil de GitHub
2. Selecciona "Developer settings" en el menú lateral
3. Selecciona "Personal access tokens" y luego "Tokens (classic)"
4. Haz clic en "Generate new token"
5. Dale un nombre descriptivo y selecciona los permisos necesarios (al menos "repo")
6. Haz clic en "Generate token"
7. Copia el token generado (solo se mostrará una vez)

Usa este token como contraseña cuando GitHub te lo solicite.

## Alternativa: Usar GitHub Desktop

Si prefieres una interfaz gráfica, puedes usar GitHub Desktop:

1. Descarga e instala [GitHub Desktop](https://desktop.github.com/)
2. Abre la aplicación e inicia sesión con tu cuenta de GitHub
3. Añade el repositorio local a GitHub Desktop (File > Add local repository)
4. Publica el repositorio en GitHub (Repository > Publish repository)
5. Configura el nombre y la descripción, y haz clic en "Publish repository"
