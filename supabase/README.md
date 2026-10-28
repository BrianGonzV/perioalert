# Configurar Supabase

Esta carpeta contiene las migraciones SQL del proyecto. Crean tablas para perfiles, hábitos, recordatorios y solicitudes de cita, un bucket privado para fotos y el envío de correo mediante una Edge Function. No incluye datos de pacientes demo. Cada tabla tiene RLS; el rol clínico se asigna desde SQL, no desde el navegador.

## Arranque guiado sin Supabase CLI

1. Crea un proyecto en el [Dashboard de Supabase](https://supabase.com/dashboard). Guarda la contraseña de base de datos en un administrador de contraseñas; Perioalert no la necesita para el frontend.
2. Abre **SQL Editor → New query**.
3. Ejecuta en SQL Editor, en ese orden y en consultas separadas, `migrations/202610280001_initial_schema.sql`, `migrations/202610280002_appointment_time_slots.sql`, `migrations/202610280003_appointment_photos_notes_email.sql`, `migrations/202610280004_appointment_patient_identity.sql` y `migrations/202610280005_appointment_confirmation_email.sql`. La cuarta añade edad y DNI opcional al perfil; la quinta guarda el correo de destino y actualiza el consentimiento a v4.
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
- Las citas se solicitan por fecha y horario de 30 minutos; permanecen pendientes hasta que la clínica las confirme.
- La solicitud pide nombre completo y edad, y permite registrar un DNI peruano de ocho dígitos de forma opcional. Estos datos se guardan en el perfil del paciente; solo el paciente y el personal autorizado de clínica pueden verlos.
- La solicitud también permite una descripción opcional y hasta tres fotos privadas. Cada foto puede ser JPG, PNG o WebP y pesar hasta 5 MB.
- El aviso de privacidad `v4` es un borrador de demostración: valida si la clínica necesita el DNI y completa la identidad, el contacto, la retención y el texto aprobado antes de recibir datos reales.
- El correo de recepción se envía desde una Edge Function con Resend; no se envían la descripción ni las fotos en el correo.
- Los paneles demo usan filas ficticias en el frontend y nunca las insertan en la base de datos.

Para una base que ya esté en producción, usa migraciones versionadas para los cambios posteriores y evita editar tablas manualmente en Dashboard sin registrar la migración en el repositorio.

## Agenda con horarios específicos

La migración `migrations/202610280002_appointment_time_slots.sql` agrega horarios de 30 minutos para la clínica ficticia de Trujillo, protege cada espacio contra solicitudes duplicadas y expone únicamente las horas ocupadas (sin datos del paciente) a la cuenta autenticada.

- Si ya ejecutaste la migración inicial en SQL Editor, ejecuta ahora el contenido completo de `202610280002_appointment_time_slots.sql` en una consulta nueva.
- Si aún no configuraste la base, ejecuta primero `202610280001_initial_schema.sql` y después `202610280002_appointment_time_slots.sql`.
- Para activar los adjuntos, descripciones y el correo, ejecuta después `202610280003_appointment_photos_notes_email.sql`.
- Para solicitar nombre, edad y DNI opcional en las citas, ejecuta `202610280004_appointment_patient_identity.sql` después de la migración 003.
- Para guardar una dirección de correo de confirmación por solicitud, ejecuta `202610280005_appointment_confirmation_email.sql` después de la migración 004.
- La web de demostración guarda citas ficticias solo en el almacenamiento local del navegador. Las citas reales requieren inicio de sesión y usan la base de datos.
- La clínica y su ubicación, agenda y registros de demostración son ficticios. Reemplázalos y confirma el aviso de privacidad antes de publicar reservas reales.

## Fotos, descripción y correo de solicitud

La migración `migrations/202610280003_appointment_photos_notes_email.sql` crea el bucket privado `appointment-photos`, los permisos de lectura para el paciente y el rol clínico, los campos de descripción y consentimiento, y el estado idempotente del correo. Las migraciones 004 y 005 añaden los datos del paciente y el correo de destino elegido para cada cita.

1. Ejecuta la migración `202610280003_appointment_photos_notes_email.sql` después de `202610280002_appointment_time_slots.sql`.
2. Verifica tu dominio de envío en Resend y crea una API key de envío. El dominio debe estar verificado antes de mandar correos a pacientes.
3. Configura estos secretos en **Supabase → Edge Functions → Secrets**. Nunca los añadas a `VITE_*` ni los guardes en Git:

   - `RESEND_API_KEY`: API key de Resend.
   - `RESEND_FROM_EMAIL`: remitente usando el dominio verificado, por ejemplo `Perioalert <citas@tu-dominio.pe>`.
   - `APP_ALLOWED_ORIGINS`: orígenes separados por comas, por ejemplo `http://localhost:5173,https://tu-dominio.vercel.app`.

4. Con Supabase CLI autenticado y el proyecto enlazado, despliega la función:

   ```bash
   supabase functions deploy send-appointment-confirmation --project-ref axvhkaktvhxiokrrmtui
   ```

La pantalla confirma primero que la solicitud quedó guardada. Si el proveedor de correo falla, permite reintentar sin duplicar el correo. El correo contiene únicamente la fecha y hora; los datos identificativos, las fotos y la descripción solo aparecen en el panel privado de clínica.

El campo de destinatario se precarga con el correo de la cuenta y puede editarse antes de enviar la solicitud. La dirección se guarda con la cita y se muestra al personal autorizado de clínica. La confirmación se envía desde `RESEND_FROM_EMAIL` al correo elegido.
