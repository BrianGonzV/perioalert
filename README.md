# Perioalert

Plataforma educativa periodontal en React, TypeScript y Vite. Incluye páginas públicas con fotografías reales, registro e inicio de sesión Supabase, portal de paciente, agenda con horarios, citas confirmadas automáticamente, correo con resumen PDF, fotos privadas y panel clínico.

## Desarrollo local

```bash
npm install
npm run dev
```

Sin variables Supabase, el portal de paciente y el panel clínico muestran ejemplos ficticios etiquetados como **DEMO**. No se guardan en la base de datos. Para validar la compilación ejecuta `npm run build`.

## Conectar Supabase

Sigue los pasos completos en [supabase/README.md](supabase/README.md). La migración está en `supabase/migrations/` y el ejemplo para autorizar al primer administrador en `supabase/bootstrap_admin.sql`.

Variables locales requeridas después de crear el proyecto:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Nunca uses `service_role` en el frontend. Los ejemplos demo son ficticios; no añadas datos de pacientes al repositorio.

Ejecuta las seis migraciones en orden; en una base que ya tenga las anteriores, aplica `202610280006_auto_confirm_appointment_pdf.sql` en Supabase SQL Editor. Despliega `send-appointment-confirmation` y configura el dominio y las claves de Resend en los secretos de Supabase según la guía. Las nuevas reservas se confirman automáticamente y el correo incluye el resumen y PDF. Consulta [la guía de Supabase](supabase/README.md) si el correo falla y [los créditos de fotografías](docs/image-credits.md) para conocer las fuentes.

## Publicar

```bash
git add .
git commit -m "Conectar portal Perioalert con Supabase"
git push
```

Al estar conectado a GitHub, Vercel desplegará el commit. Configura también las dos variables `VITE_SUPABASE_*` en **Vercel → Project → Settings → Environment Variables** y vuelve a desplegar para activar la conexión alojada. `vercel.json` configura las rutas directas.

## Alcance del prototipo

Los perfiles, hábitos, recordatorios y citas se guardan con RLS por usuario. La agenda ofrece turnos de 30 minutos y bloquea duplicados. El nombre y la edad se piden al reservar; el DNI es opcional y solo se muestra al paciente y al personal autorizado. Las fotos se guardan en un bucket privado. La clínica, su ubicación y sus horarios son de demostración. Reemplázalos y aprueba el aviso de privacidad, la necesidad de cada dato, el consentimiento, los contactos y las reglas operativas antes de recibir pacientes reales.
