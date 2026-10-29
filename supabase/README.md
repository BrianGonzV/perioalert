# Configurar Supabase

Esta carpeta contiene las migraciones SQL del proyecto. Crean tablas para perfiles, hábitos, recordatorios y solicitudes de cita, un bucket privado para fotos y el envío de correo mediante una Edge Function. No incluye datos de pacientes demo. Cada tabla tiene RLS; el rol clínico se asigna desde SQL, no desde el navegador.

## Arranque guiado sin Supabase CLI

1. Crea un proyecto en el [Dashboard de Supabase](https://supabase.com/dashboard). Guarda la contraseña de base de datos en un administrador de contraseñas; Perioalert no la necesita para el frontend.
2. Abre **SQL Editor → New query**.
3. Ejecuta en SQL Editor, en ese orden y en consultas separadas, las migraciones `202610280001` a `202610280006`. La cuarta añade edad y DNI opcional, la quinta guarda el correo de destino y la sexta confirma nuevas reservas automáticamente y actualiza el consentimiento a v5.
4. Crea `.env.local` en la raíz a partir de `.env.example`. En **Project Settings → API Keys** o en el panel **Connect** copia el Project URL y la publishable key:

   ```dotenv
   VITE_SUPABASE_URL=https://TU-PROJECT-REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   La clave `anon` pública antigua también sirve. Nunca copies `service_role`, una secret key ni la contraseña de base de datos en un archivo `VITE_*`.
5. En Supabase Auth, configura **URL Configuration**: Site URL con el dominio de producción de Vercel y Redirect URLs con `http://localhost:5173/**` y tu dominio Vercel. Esto habilita los enlaces de confirmación y recuperación de contraseña.
6. Ejecuta `npm run dev`, crea una cuenta en `/cuenta` y confirma el correo si el proyecto lo solicita.
7. Para dar acceso de clínica, abre `bootstrap_admin.sql`, reemplaza el correo de ejemplo y ejecútalo en **SQL Editor**. Solo hazlo con la cuenta del administrador autorizado.
8. En Vercel, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en **Project → Settings → Environment Variables** para Production, Preview y Development. Luego redeploya la última versión.

La clave publishable está pensada para aparecer en el navegador. La autorización real la aplican Auth y las políticas RLS de Postgres. El rol `clinic_admin` no se puede elegir ni modificar desde la web.

## Alcance actual y pendientes

- El registro crea perfil y rol paciente automáticamente.
- El portal guarda perfil, lista de recordatorios y checks diarios asociados al usuario autenticado.
- Los recordatorios se guardan, pero todavía no envían notificaciones.
- Las nuevas citas reservan automáticamente un horario de 30 minutos y quedan confirmadas en la agenda; no requieren aprobación manual.
- La solicitud pide nombre completo y edad, y permite registrar un DNI peruano de ocho dígitos de forma opcional. Estos datos se guardan en el perfil del paciente; solo el paciente y el personal autorizado de clínica pueden verlos.
- La solicitud también permite una descripción opcional y hasta tres fotos privadas. Cada foto puede ser JPG, PNG o WebP y pesar hasta 5 MB.
- El aviso de privacidad `v5` sigue siendo un borrador: la clínica debe completar su identidad legal, contacto, retención y texto aprobado antes de recibir datos reales.
- La Edge Function envía una confirmación con resumen y PDF adjunto. El correo y PDF omiten DNI, fotos y descripción personal.
- Los paneles demo usan filas ficticias en el frontend y nunca las insertan en la base de datos.

Para una base que ya esté en producción, usa migraciones versionadas para los cambios posteriores y evita editar tablas manualmente en Dashboard sin registrar la migración en el repositorio.

## Agenda con horarios específicos

La migración `migrations/202610280002_appointment_time_slots.sql` agrega horarios de 30 minutos para la clínica ficticia de Trujillo, protege cada espacio contra solicitudes duplicadas y expone únicamente las horas ocupadas (sin datos del paciente) a la cuenta autenticada.

- Si ya ejecutaste la migración inicial en SQL Editor, ejecuta ahora el contenido completo de `202610280002_appointment_time_slots.sql` en una consulta nueva.
- Si aún no configuraste la base, ejecuta primero `202610280001_initial_schema.sql` y después `202610280002_appointment_time_slots.sql`.
- Para activar los adjuntos, descripciones y el correo, ejecuta después `202610280003_appointment_photos_notes_email.sql`.
- Para solicitar nombre, edad y DNI opcional en las citas, ejecuta `202610280004_appointment_patient_identity.sql` después de la migración 003.
- Para guardar una dirección de correo de confirmación por solicitud, ejecuta `202610280005_appointment_confirmation_email.sql` después de la migración 004.
- Para confirmar automáticamente nuevas reservas, permitir sus fotos y aceptar el consentimiento v5, ejecuta `202610280006_auto_confirm_appointment_pdf.sql` después de la migración 005.
- La web de demostración guarda citas ficticias solo en el almacenamiento local del navegador. Las citas reales requieren inicio de sesión y usan la base de datos.
- La clínica y su ubicación, agenda y registros de demostración son ficticios. Reemplázalos y confirma el aviso de privacidad antes de publicar reservas reales.

## Fotos, descripción y correo con PDF

Las migraciones 003 a 006 crean el bucket privado de fotos, guardan la información de identidad y el correo destino, confirman el horario al reservar y controlan el envío idempotente del resumen PDF.

1. Ejecuta `202610280006_auto_confirm_appointment_pdf.sql` en SQL Editor después de las migraciones anteriores. No vuelvas a ejecutar 001–005 si ya las aplicaste.
2. En Resend, verifica el dominio remitente y crea una API key. El dominio remitente debe estar verificado para entregar correo a pacientes.
3. Configura estos secretos en **Supabase → Edge Functions → Secrets**. Nunca los añadas a `VITE_*` ni los guardes en Git:

   - `RESEND_API_KEY`: API key de Resend.
   - `RESEND_FROM_EMAIL`: remitente usando el dominio verificado, por ejemplo `Perioalert <citas@tu-dominio.pe>`.
   - `APP_ALLOWED_ORIGINS`: orígenes exactos separados por comas, sin rutas, por ejemplo `http://localhost:5173,https://tu-dominio.vercel.app`. Añade también el dominio de producción personalizado si lo tienes.

   También puedes guardarlos con Supabase CLI desde PowerShell (reemplaza los ejemplos y usa el dominio que ves en la barra del navegador al abrir Vercel):

   ```powershell
   supabase secrets set RESEND_API_KEY=re_REEMPLAZAR "RESEND_FROM_EMAIL=Perioalert <citas@dominio-verificado.pe>" "APP_ALLOWED_ORIGINS=http://localhost:5173,https://tu-dominio.vercel.app" --project-ref axvhkaktvhxiokrrmtui
   ```

   No pegues el valor real de `RESEND_API_KEY` en el repositorio, el chat ni una variable `VITE_*`.

4. Despliega la función Edge con Supabase CLI (los secretos integrados de Supabase para URL y claves los aporta el proyecto). También puedes desplegar la función desde el Dashboard de Supabase:

   ```bash
   supabase login
   supabase link --project-ref axvhkaktvhxiokrrmtui
   supabase functions deploy send-appointment-confirmation --project-ref axvhkaktvhxiokrrmtui
   ```

5. Crea una cita con una cuenta paciente. El estado debe aparecer como confirmada y el correo seleccionado debe recibir el resumen y `Perioalert-cita-AAAA-MM-DD.pdf`. Si Resend rechaza el envío, la pantalla muestra el error del proveedor y permite reintentarlo con una clave idempotente.

6. Si falla, revisa **Supabase → Edge Functions → Logs** y **Resend → Emails**. Comprueba primero que la migración 006 se aplicó, la función se desplegó después del cambio, el origen de Vercel está en `APP_ALLOWED_ORIGINS`, el dominio remitente está verificado y los secretos estén guardados en el proyecto Supabase correcto.

El campo de destinatario se precarga con el correo de la cuenta y puede editarse antes de reservar. La dirección se guarda con la cita y solo se muestra al paciente y al personal autorizado. El correo incluye el nombre, fecha, hora, motivo general y código de cita. No adjunta el DNI, las fotos ni la descripción.

**La agenda, la ubicación de Trujillo y la clínica siguen siendo datos ficticios de demostración.** Aunque la reserva y el envío funcionen, configura el centro, dirección, agenda real y aviso de privacidad aprobado antes de aceptar pacientes.
