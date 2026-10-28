# Perioalert

Plataforma educativa periodontal en React, TypeScript y Vite. Incluye páginas públicas, registro e inicio de sesión Supabase, portal de paciente, agenda con horarios, solicitudes con nombre, edad, DNI opcional, correo de confirmación, descripción y fotos privadas, y panel clínico.

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

Ejecuta las cinco migraciones en orden; en una base ya existente, aplica también `202610280004_appointment_patient_identity.sql` y `202610280005_appointment_confirmation_email.sql` en Supabase SQL Editor. La quinta habilita el correo de destino de la confirmación. Despliega `send-appointment-confirmation` y configura Resend en los secretos de Supabase según la guía. Sin ese proveedor configurado, la cita se guarda y la pantalla informa que el correo no se pudo enviar.

## Publicar

```bash
git add .
git commit -m "Conectar portal Perioalert con Supabase"
git push
```

Al estar conectado a GitHub, Vercel desplegará el commit. Configura también las dos variables `VITE_SUPABASE_*` en **Vercel → Project → Settings → Environment Variables** y vuelve a desplegar para activar la conexión alojada. `vercel.json` configura las rutas directas.

## Alcance del prototipo

Los perfiles, hábitos, recordatorios y solicitudes se guardan con RLS por usuario. La agenda ofrece turnos de 30 minutos y bloquea duplicados. El nombre y la edad se piden al reservar; el DNI de ocho dígitos es opcional y solo se muestra al paciente y al personal autorizado. Las fotos se guardan en un bucket privado. La clínica, su ubicación y sus horarios son de demostración. Reemplázalos y confirma el aviso de privacidad, la necesidad de cada dato, el consentimiento, los contactos y las reglas operativas antes de recibir datos reales.
