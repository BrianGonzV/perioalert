import { createClient } from 'npm:@supabase/supabase-js@2'

function defaultKeyFromEnvironment(variable: string) {
  try {
    const keys = JSON.parse(Deno.env.get(variable) ?? '{}') as Record<string, unknown>
    return typeof keys.default === 'string' ? keys.default : ''
  } catch {
    return ''
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || defaultKeyFromEnvironment('SUPABASE_PUBLISHABLE_KEYS')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || defaultKeyFromEnvironment('SUPABASE_SECRET_KEYS')
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
const sender = Deno.env.get('RESEND_FROM_EMAIL') ?? ''
const allowedOrigins = new Set((Deno.env.get('APP_ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean))

function headersFor(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
  }
}

function respond(origin: string | null, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headersFor(origin) })
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00Z`))
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  if (request.method === 'OPTIONS') return new Response('ok', { headers: headersFor(origin) })
  if (request.method !== 'POST') return respond(origin, { error: 'Método no permitido.' }, 405)
  if (origin && !allowedOrigins.has(origin)) return respond(origin, { error: 'Origen no autorizado.' }, 403)
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !resendApiKey || !sender) {
    return respond(origin, { error: 'Falta configurar el envío de correo en Supabase.' }, 503)
  }

  const authorization = request.headers.get('authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) return respond(origin, { error: 'Inicia sesión para enviar esta solicitud.' }, 401)

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !authData.user?.email) return respond(origin, { error: 'La sesión no es válida.' }, 401)

  let body: { requestId?: unknown }
  try {
    body = await request.json()
  } catch {
    return respond(origin, { error: 'Solicitud inválida.' }, 400)
  }
  if (typeof body.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId)) {
    return respond(origin, { error: 'Falta una solicitud válida.' }, 400)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: claim, error: claimError } = await admin.rpc('claim_appointment_confirmation_email', {
    p_request_id: body.requestId,
    p_patient_id: authData.user.id,
  })
  if (claimError) return respond(origin, { error: 'No pudimos preparar el correo. Verifica las migraciones de la agenda.' }, 500)

  const appointment = Array.isArray(claim) ? claim[0] : null
  if (!appointment) {
    const { data: existing } = await admin.from('appointment_requests')
      .select('patient_id, status, confirmation_email_sent_at')
      .eq('id', body.requestId)
      .maybeSingle()
    if (!existing || existing.patient_id !== authData.user.id) return respond(origin, { error: 'No se encontró la solicitud.' }, 404)
    if (existing.confirmation_email_sent_at) return respond(origin, { sent: true, alreadySent: true })
    return respond(origin, { error: 'El correo ya se está preparando. Espera un momento y vuelve a consultar.' }, 409)
  }

  const dateLabel = formatDate(appointment.requested_date)
  const timeLabel = String(appointment.requested_time).slice(0, 5)
  const message = `Recibimos tu solicitud de cita para el ${dateLabel} a las ${timeLabel} (hora de Trujillo). La cita permanece pendiente hasta que la clínica confirme la disponibilidad. No incluyas datos de salud al responder este correo.`
  let providerError = ''
  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `appointment-confirmation-${body.requestId}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [appointment.confirmation_email || authData.user.email],
        subject: 'Recibimos tu solicitud de cita · Perioalert',
        text: message,
        html: `<div style="font-family:Arial,sans-serif;color:#123b64;line-height:1.7"><h1 style="font-size:22px">Solicitud recibida</h1><p>${message}</p><p style="font-size:13px;color:#526a7d">Este correo confirma la recepción de la solicitud; no confirma una cita.</p></div>`,
      }),
    })
    if (!emailResponse.ok) providerError = `Resend respondió HTTP ${emailResponse.status}.`
  } catch {
    providerError = 'No se pudo contactar con el proveedor de correo.'
  }

  if (providerError) {
    await admin.from('appointment_requests')
      .update({ confirmation_email_claimed_at: null })
      .eq('id', body.requestId)
      .eq('patient_id', authData.user.id)
    console.error('Appointment confirmation email failed', providerError)
    return respond(origin, { error: 'La solicitud está guardada, pero el correo no se pudo enviar. Puedes reintentarlo.' }, 502)
  }

  const { error: updateError } = await admin.from('appointment_requests')
    .update({ confirmation_email_sent_at: new Date().toISOString(), confirmation_email_claimed_at: null })
    .eq('id', body.requestId)
    .eq('patient_id', authData.user.id)
  if (updateError) console.error('Appointment email status update failed', updateError.message)
  return respond(origin, { sent: true })
})
