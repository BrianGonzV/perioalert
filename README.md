# Perioalert

Primera versión pública de una plataforma educativa para el cuidado periodontal. Está hecha con React, TypeScript y Vite. Esta entrega incluye solo contenido educativo público; aún no guarda datos ni gestiona cuentas o citas.

## Ejecutar en tu computadora

1. Instala Node.js LTS desde [nodejs.org](https://nodejs.org/) y Git desde [git-scm.com](https://git-scm.com/).
2. Abre esta carpeta en VS Code.
3. Abre **Terminal → New Terminal**.
4. Ejecuta:

   ```bash
   npm install
   npm run dev
   ```

5. Abre la dirección local que aparece en la terminal (normalmente `http://localhost:5173`). Para detener el servidor, pulsa `Ctrl+C`.

Antes de publicar, comprueba la compilación:

```bash
npm run build
```

## Publicar en GitHub

1. Crea una cuenta en [github.com](https://github.com/) e inicia sesión.
2. Pulsa **New repository**. Escribe `perioalert`, elige **Public** o **Private** y crea el repositorio **sin** README, `.gitignore` ni licencia (ya existen en este proyecto).
3. En la terminal de VS Code, desde esta carpeta, ejecuta estos comandos, reemplazando `TU-USUARIO` por tu nombre de usuario de GitHub:

   ```bash
   git init
   git add .
   git commit -m "Crear primera versión de Perioalert"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/perioalert.git
   git push -u origin main
   ```

4. GitHub puede pedirte iniciar sesión en el navegador. Al terminar, actualiza el repositorio en GitHub y confirma que ves los archivos.

Si Git te dice que falta `user.name` o `user.email`, configura el nombre y correo que quieras asociar a tus commits:

```bash
git config --global user.name "Tu nombre"
git config --global user.email "tu-correo@example.com"
```

## Publicar en Vercel

1. Entra en [vercel.com](https://vercel.com/) y regístrate o inicia sesión con GitHub.
2. Pulsa **Add New… → Project** y autoriza el acceso al repositorio `perioalert`.
3. Selecciona el repositorio y pulsa **Import**.
4. Vercel detectará Vite. Revisa que el comando de compilación sea `npm run build` y la carpeta de salida `dist`; normalmente los detecta automáticamente.
5. Pulsa **Deploy**. Cuando termine, abre el enlace `*.vercel.app` para ver la web publicada.
6. En adelante, cada `git push` a `main` hará que Vercel vuelva a desplegar la página. Las ramas de trabajo también pueden generar enlaces de vista previa.

## Antes de habilitar cuentas o citas

No hay claves ni conexión de Supabase en este repositorio. Para implementar autenticación, recordatorios, citas y administración hace falta crear un proyecto Supabase y definir datos reales de la clínica, textos de consentimiento y disponibilidad. Las claves públicas de frontend se configuran como variables de entorno en Vercel; nunca se debe incluir una clave `service_role` en el frontend ni subir archivos `.env` a GitHub.

La información de esta web es educativa y no reemplaza una evaluación odontológica.
