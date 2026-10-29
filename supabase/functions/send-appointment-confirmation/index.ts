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
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean))

function headersFor(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin.replace(/\/$/, '')) ? origin : 'null',
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

function reasonLabel(reason: string) {
  const labels: Record<string, string> = {
    checkup: 'Control preventivo',
    bleeding: 'Sangrado de encías',
    sensitivity: 'Sensibilidad',
    other: 'Otra consulta',
  }
  return labels[reason] ?? 'Consulta odontológica'
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character)
}

const winAnsiSpecials: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
}

function pdfHexText(value: string) {
  const bytes = Array.from(value, (character) => {
    const code = character.codePointAt(0) ?? 0x3f
    const mapped = winAnsiSpecials[code] ?? code
    return mapped >= 0x20 && mapped <= 0xff ? mapped : 0x3f
  })
  return `<${bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}>`
}

function wrapText(value: string, maxLength: number) {
  const words = value.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if (line && `${line} ${word}`.length > maxLength) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines
}

function makeAppointmentPdf(appointment: {
  id: string
  full_name: string
  requested_date: string
  requested_time: string
  reason_code: string
}) {
  const dateLabel = formatDate(appointment.requested_date)
  const timeLabel = appointment.requested_time.slice(0, 5)
  const name = appointment.full_name.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 120) || 'Paciente'
  const rows = [
    ['Nombre', name],
    ['Fecha', dateLabel],
    ['Hora', `${timeLabel} (hora de Trujillo)`],
    ['Motivo general', reasonLabel(appointment.reason_code)],
    ['Estado', 'Horario confirmado automáticamente'],
  ] as const

  const operators = [
    'q', '0.02 0.37 0.68 rg', '0 828 595 14 re f', 'Q',
    `BT /F1 25 Tf 52 770 Td ${pdfHexText('Perioalert')} Tj ET`,
    `BT /F1 11 Tf 52 744 Td ${pdfHexText('COMPROBANTE DE CITA CONFIRMADA')} Tj ET`,
    `BT /F1 9 Tf 52 720 Td ${pdfHexText(`Código: ${appointment.id.slice(0, 8).toUpperCase()}`)} Tj ET`,
    '0.83 0.90 0.95 RG 52 704 m 543 704 l S',
  ]

  let y = 676
  for (const [label, value] of rows) {
    operators.push(`0.29 0.42 0.53 rg BT /F1 9 Tf 52 ${y} Td ${pdfHexText(label.toUpperCase())} Tj ET`)
    y -= 18
    for (const line of wrapText(value, 68)) {
      operators.push(`0.07 0.23 0.39 rg BT /F1 12 Tf 52 ${y} Td ${pdfHexText(line)} Tj ET`)
      y -= 17
    }
    y -= 10
  }

  y -= 3
  operators.push('0.91 0.96 0.99 rg 52 110 491 96 re f')
  operators.push(`0.07 0.23 0.39 rg BT /F1 10 Tf 66 181 Td ${pdfHexText('Tu horario quedó reservado en la agenda digital de Perioalert.')} Tj ET`)
  operators.push(`0.25 0.38 0.49 rg BT /F1 9 Tf 66 160 Td ${pdfHexText('La dirección física y los canales oficiales de la clínica aún deben configurarse.')} Tj ET`)
  operators.push(`0.25 0.38 0.49 rg BT /F1 9 Tf 66 144 Td ${pdfHexText('Confirma el lugar de atención con tu profesional antes de desplazarte.')} Tj ET`)
  operators.push('0.55 0.64 0.71 rg BT /F1 8 Tf 52 60 Td (Documento informativo. No incluye DNI, fotos ni descripciones personales.) Tj ET')

  const stream = operators.join('\n')
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ]
  let document = '%PDF-1.4\n'
  const offsets = [0]
  for (const object of objects) {
    offsets.push(document.length)
    document += `${object}`
  }
  const xrefOffset = document.length
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) document += `${String(offset).padStart(10, '0')} 00000 n \n`
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new TextEncoder().encode(document)
}

function base64(bytes: Uint8Array) {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  if (request.method === 'OPTIONS') return new Response('ok', { headers: headersFor(origin) })
  if (request.method !== 'POST') return respond(origin, { error: 'Método no permitido.' }, 405)
  if (origin && !allowedOrigins.has(origin.replace(/\/$/, ''))) return respond(origin, { error: 'Origen no autorizado. Añade el dominio de Vercel a APP_ALLOWED_ORIGINS.' }, 403)
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !resendApiKey || !sender || !allowedOrigins.size) {
    return respond(origin, { error: 'Falta configurar el envío: SUPABASE_URL, claves de Supabase, RESEND_API_KEY, RESEND_FROM_EMAIL y APP_ALLOWED_ORIGINS.' }, 503)
  }

  const authorization = request.headers.get('authorization') ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) return respond(origin, { error: 'Inicia sesión para enviar esta cita.' }, 401)

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
    return respond(origin, { error: 'Falta una cita válida.' }, 400)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: claim, error: claimError } = await admin.rpc('claim_appointment_confirmation_email', {
    p_request_id: body.requestId,
    p_patient_id: authData.user.id,
  })
  if (claimError) {
    console.error('Appointment email claim failed', claimError.message)
    return respond(origin, { error: 'No pudimos preparar el correo. Aplica la migración 006 y vuelve a desplegar la función.' }, 500)
  }

  const appointment = Array.isArray(claim) ? claim[0] : null
  if (!appointment) {
    const { data: existing } = await admin.from('appointment_requests')
      .select('patient_id, status, confirmation_email_sent_at')
      .eq('id', body.requestId)
      .maybeSingle()
    if (!existing || existing.patient_id !== authData.user.id) return respond(origin, { error: 'No se encontró la cita.' }, 404)
    if (existing.confirmation_email_sent_at) return respond(origin, { sent: true, alreadySent: true })
    return respond(origin, { error: 'No se pudo confirmar el envío. Actualiza la pantalla y vuelve a intentarlo.' }, 409)
  }

  const patientName = String(appointment.full_name || 'Paciente').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 120)
  const dateLabel = formatDate(appointment.requested_date)
  const timeLabel = String(appointment.requested_time).slice(0, 5)
  const reason = reasonLabel(String(appointment.reason_code ?? 'other'))
  const appointmentId = String(appointment.appointment_id || body.requestId)
  const confirmationCode = appointmentId.slice(0, 8).toUpperCase()
  const text = [
    `Hola ${patientName}:`,
    '',
    'Tu cita quedó confirmada y el horario está reservado automáticamente en la agenda digital de Perioalert.',
    `Fecha: ${dateLabel}`,
    `Hora: ${timeLabel} (hora de Trujillo)`,
    `Motivo general: ${reason}`,
    `Código de cita: ${confirmationCode}`,
    '',
    'Adjuntamos un PDF con este resumen. El PDF no incluye DNI, fotos ni la descripción personal.',
    'La dirección física y los canales oficiales de la clínica todavía deben configurarse. Confirma el lugar de atención con tu profesional antes de desplazarte.',
    '',
    'Perioalert · Salud periodontal',
  ].join('\n')
  const safeName = escapeHtml(patientName)
  const safeDate = escapeHtml(dateLabel)
  const safeTime = escapeHtml(timeLabel)
  const safeReason = escapeHtml(reason)
  const pdf = makeAppointmentPdf({
    id: appointmentId,
    full_name: patientName,
    requested_date: String(appointment.requested_date),
    requested_time: String(appointment.requested_time),
    reason_code: String(appointment.reason_code ?? 'other'),
  })

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
        subject: 'Cita confirmada · Resumen de Perioalert',
        text,
        html: `<div style="margin:0;padding:32px 12px;background:#eef7fc;font-family:Arial,sans-serif;color:#183d60"><div style="max-width:560px;margin:auto;padding:32px;background:#fff;border:1px solid #d7e9f5;border-radius:18px"><div style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#0877b8">PERIOALERT · SALUD PERIODONTAL</div><h1 style="margin:18px 0 8px;font-size:25px;color:#123b64">Tu cita está confirmada</h1><p style="margin:0 0 22px;line-height:1.6;color:#526d82">Hola ${safeName}, reservamos automáticamente este horario en la agenda digital.</p><table style="width:100%;border-collapse:collapse;color:#234965"><tr><td style="padding:11px 0;border-top:1px solid #e5eff6;color:#61788c">Fecha</td><td style="padding:11px 0;border-top:1px solid #e5eff6;font-weight:bold">${safeDate}</td></tr><tr><td style="padding:11px 0;border-top:1px solid #e5eff6;color:#61788c">Hora</td><td style="padding:11px 0;border-top:1px solid #e5eff6;font-weight:bold">${safeTime} · Trujillo</td></tr><tr><td style="padding:11px 0;border-top:1px solid #e5eff6;color:#61788c">Motivo</td><td style="padding:11px 0;border-top:1px solid #e5eff6;font-weight:bold">${safeReason}</td></tr><tr><td style="padding:11px 0;border-top:1px solid #e5eff6;color:#61788c">Código</td><td style="padding:11px 0;border-top:1px solid #e5eff6;font-weight:bold">${confirmationCode}</td></tr></table><p style="margin:22px 0 8px;padding:14px;border-radius:10px;background:#edf8fd;font-size:13px;line-height:1.6;color:#315f81">Adjuntamos un PDF con el resumen. No incluye DNI, fotos ni tu descripción personal.</p><p style="margin:0;font-size:12px;line-height:1.65;color:#526d82">La dirección y los canales oficiales de la clínica aún deben configurarse. Confirma el lugar de atención con tu profesional antes de desplazarte.</p></div></div>`,
        attachments: [{
          filename: `Perioalert-cita-${appointment.requested_date}.pdf`,
          content: base64(pdf),
        }],
      }),
    })
    if (!emailResponse.ok) {
      const providerBody = await emailResponse.json().catch(() => null) as { message?: unknown } | null
      const detail = typeof providerBody?.message === 'string' ? ` ${providerBody.message.slice(0, 240)}` : ''
      providerError = `Resend respondió HTTP ${emailResponse.status}.${detail}`
    }
  } catch (error) {
    providerError = error instanceof Error ? error.message.slice(0, 240) : 'No se pudo contactar con Resend.'
  }

  if (providerError) {
    await admin.from('appointment_requests')
      .update({ confirmation_email_claimed_at: null })
      .eq('id', body.requestId)
      .eq('patient_id', authData.user.id)
    console.error('Appointment confirmation email failed', providerError)
    return respond(origin, { error: `La cita está guardada, pero no se pudo enviar el correo con el PDF. ${providerError}` }, 502)
  }

  const { error: updateError } = await admin.from('appointment_requests')
    .update({ confirmation_email_sent_at: new Date().toISOString(), confirmation_email_claimed_at: null })
    .eq('id', body.requestId)
    .eq('patient_id', authData.user.id)
  if (updateError) console.error('Appointment email status update failed', updateError.message)
  return respond(origin, { sent: true })
})
