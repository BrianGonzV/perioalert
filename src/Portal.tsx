import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2,
  Clock3, ImagePlus, LoaderCircle, LogOut, Mail, MapPin, Phone, Plus, ShieldCheck, Sparkles, Trash2, UserRound, Users, X,
} from 'lucide-react'
import { useAuth } from './lib/auth'
import { supabase } from './lib/supabase'
import { clinicDates, clinicSlots, clinicToday, formatClinicDate, makeDemoSeedBookings, readDemoBookings, writeDemoBookings, type DemoBooking } from './lib/appointments'
import type { AppointmentAttachment, AppointmentRequest, CareLog, CareReminder, PatientProfile, RequestStatus } from './lib/database.types'

const demoAppointments = makeDemoSeedBookings()

const todayLocal = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const MAX_APPOINTMENT_PHOTOS = 3
const MAX_APPOINTMENT_PHOTO_BYTES = 5 * 1024 * 1024
const ALLOWED_APPOINTMENT_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function PhotoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = useState('')
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return <div className="appointment-photo-preview">
    {preview && <img src={preview} alt={`Vista previa: ${file.name}`} />}
    <span title={file.name}>{file.name}</span>
    <button type="button" aria-label={`Quitar ${file.name}`} onClick={onRemove}><X size={15} /></button>
  </div>
}

function DemoBanner() {
  return <div className="demo-banner"><Sparkles size={17} /><div><strong>Modo demostración · datos ficticios</strong><span>Los cambios de prueba no se envían a una clínica ni a Supabase.</span></div><span className="demo-chip">DEMO</span></div>
}

function FormMessage({ children, kind = 'success' }: { children: string; kind?: 'success' | 'error' }) {
  return <p className={`form-message ${kind}`} role="status">{kind === 'success' ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}{children}</p>
}

function readableAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (/email rate limit exceeded|over_email_send_rate_limit/i.test(message)) {
    return 'Supabase alcanzó su límite temporal de correos. Espera antes de volver a intentarlo. Si ya desactivaste la confirmación, comprueba que el cambio esté guardado; para enviar correos a usuarios necesitas configurar un SMTP propio.'
  }
  if (/email address not authorized|email_address_not_authorized/i.test(message)) {
    return 'El correo de prueba no está autorizado por el servidor de correo de Supabase. Configura un SMTP propio para aceptar direcciones externas.'
  }
  return message || 'No se pudo completar la solicitud. Inténtalo de nuevo.'
}

export function AccountPage() {
  const { configured, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const postAuthPath = location.state?.from === '/citas' ? '/citas' : '/mi-salud'
  const recoveryLink = window.location.hash.includes('type=recovery')
  const [mode, setMode] = useState<'login' | 'register' | 'reset' | 'set-password'>(recoveryLink ? 'set-password' : 'login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => { if (configured && user && !recoveryLink) navigate(postAuthPath, { replace: true }) }, [configured, user, navigate, recoveryLink, postAuthPath])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsError(false)
    if (!supabase) return
    setBusy(true)
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } })
        if (error) throw error
        if (data.session) {
          navigate(postAuthPath)
        } else {
          setMessage('Tu cuenta se creó. Revisa tu correo para confirmarla y después inicia sesión.')
        }
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/cuenta` })
        if (error) throw error
        setMessage('Si existe una cuenta con ese correo, recibirá un enlace para restablecer la contraseña.')
      } else if (mode === 'set-password') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        window.history.replaceState(null, '', window.location.pathname)
        navigate(postAuthPath)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate(postAuthPath)
      }
    } catch (error) {
      setIsError(true)
      setMessage(readableAuthError(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="content-wrap portal-page">
      {!configured ? <DemoBanner /> : null}
      <div className="account-layout">
        <section className="account-story"><span className="section-kicker">TU ESPACIO DE CUIDADO</span><h1>Una rutina que<br />te acompaña.</h1><p>Guarda tus hábitos, crea recordatorios y mantén tus solicitudes de cita en un solo lugar.</p><div className="account-benefit"><span><Check size={15} /></span> Privado para tu cuenta</div><div className="account-benefit"><span><Check size={15} /></span> Seguimiento fácil de tus hábitos</div><div className="account-benefit"><span><Check size={15} /></span> Sin notificaciones médicas automáticas</div><div className="story-orbit" /></section>
        <section className="account-card">
          <span className="section-kicker">{configured ? 'BIENVENIDO/A' : 'VISTA PREVIA'}</span>
          <h2>{configured ? (mode === 'register' ? 'Crear una cuenta' : mode === 'reset' ? 'Recuperar acceso' : mode === 'set-password' ? 'Elige una contraseña nueva' : 'Iniciar sesión') : 'Tu portal está listo para conectar'}</h2>
          {!configured ? <>
            <p className="account-intro">Conecta Supabase para habilitar cuentas reales. Mientras tanto, explora los portales de demostración con datos ficticios.</p>
            <div className="setup-steps"><span><b>01</b> Crea el proyecto y la base de datos</span><span><b>02</b> Añade las claves publicables en `.env.local`</span><span><b>03</b> Recarga la web para activar la conexión</span></div>
            <div className="account-demo-links"><Link to="/mi-salud">Ver portal paciente <ArrowRight size={16} /></Link><Link to="/clinica">Ver panel de clínica demo <ArrowRight size={16} /></Link></div>
          </> : <>
            <p className="account-intro">{mode === 'register' ? 'Regístrate con tu correo para guardar tu información de cuidado.' : mode === 'reset' ? 'Te enviaremos un enlace a tu correo si la cuenta existe.' : mode === 'set-password' ? 'Crea una nueva contraseña para recuperar el acceso.' : 'Usa el correo y contraseña de tu cuenta.'}</p>
            <form className="account-form" onSubmit={handleSubmit}>
              {mode === 'register' && <label>Nombre completo<input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>}
              {mode !== 'set-password' && <label>Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
              {mode !== 'reset' && <label>{mode === 'set-password' ? 'Nueva contraseña' : 'Contraseña'}<input required type="password" minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} /></label>}
              {message && <FormMessage kind={isError ? 'error' : 'success'}>{message}</FormMessage>}
              <button className="button button-primary full-button" type="submit" disabled={busy}>{busy ? 'Procesando…' : mode === 'register' ? 'Crear mi cuenta' : mode === 'reset' ? 'Enviar enlace' : mode === 'set-password' ? 'Actualizar contraseña' : 'Entrar'} <ArrowRight size={16} /></button>
            </form>
            <div className="account-switches">{mode !== 'login' && mode !== 'set-password' && <button type="button" onClick={() => { setMode('login'); setMessage('') }}>Volver a iniciar sesión</button>}{mode === 'login' && <><button type="button" onClick={() => { setMode('reset'); setMessage('') }}>Olvidé mi contraseña</button><button type="button" onClick={() => { setMode('register'); setMessage('') }}>Crear cuenta</button></>}</div>
          </>}
          <p className="account-privacy"><ShieldCheck size={15} /> No incluyas detalles médicos en tu contraseña ni en el correo.</p>
        </section>
      </div>
    </div>
  )
}

function HabitCheck({ label, done, onChange }: { label: string; done: boolean; onChange: () => void }) {
  return <button className={`habit-check ${done ? 'is-done' : ''}`} type="button" aria-pressed={done} onClick={onChange}><span className="check-box">{done && <Check size={14} />}</span>{label}</button>
}

function DemoPatientDashboard() {
  const [habits, setHabits] = useState([false, true, false])
  const [reminders, setReminders] = useState([{ id: 1, label: 'Cepillado de la mañana', time: '08:00', active: true }, { id: 2, label: 'Rutina de noche', time: '21:00', active: true }])
  const doneCount = habits.filter(Boolean).length
  const toggleHabit = (index: number) => setHabits((current) => current.map((value, i) => i === index ? !value : value))
  return (
    <div className="content-wrap portal-page dashboard-page"><DemoBanner /><div className="dashboard-heading"><div><span className="section-kicker">PORTAL DEL PACIENTE</span><h1>Hola, Mariana.</h1><p>Un pequeño paso de cuidado cuenta.</p></div><span className="demo-date"><CalendarDays size={16} /> Hoy · vista de ejemplo</span></div>
      <div className="dashboard-grid"><section className="dashboard-main">
        <article className="today-card"><div className="today-card-head"><div><span className="section-kicker">TU CUIDADO DE HOY</span><h2>¿Cómo va tu rutina?</h2></div><span className="progress-ring" style={{ '--progress': `${doneCount * 33.333}%` } as CSSProperties}><span>{doneCount}/3</span></span></div><div className="today-checks"><HabitCheck label="Cepillado de la mañana" done={habits[0]} onChange={() => toggleHabit(0)} /><HabitCheck label="Limpieza entre los dientes" done={habits[1]} onChange={() => toggleHabit(1)} /><HabitCheck label="Cepillado de la noche" done={habits[2]} onChange={() => toggleHabit(2)} /></div><p className="card-footnote">Marca tus hábitos en esta demo. No se guarda información.</p></article>
        <article className="week-card"><div className="card-heading"><div><span className="section-kicker">CONSTANCIA, NO PERFECCIÓN</span><h2>Tu semana</h2></div><span className="week-badge"><Activity size={15} /> Ejemplo</span></div><div className="week-bars" aria-label="Gráfico de actividad ficticia de lunes a domingo">{[['L', 42], ['M', 68], ['M', 54], ['J', 86], ['V', 63], ['S', 38], ['D', 22]].map(([day, height], index) => <div className="week-bar-col" key={`${day}-${index}`}><span className="week-bar-track"><i style={{ height: `${height}%` }} /></span><span>{day}</span></div>)}</div><p className="card-footnote">Actividad ilustrativa; no representa un historial real.</p></article>
      </section><aside className="dashboard-side">
        <article className="side-card reminder-card"><div className="card-heading"><div><span className="section-kicker">TUS RECORDATORIOS</span><h2>Momentos para ti</h2></div><Clock3 size={19} /></div>{reminders.map((reminder) => <div className="reminder-row" key={reminder.id}><span className="reminder-time">{reminder.time}</span><span className="reminder-label">{reminder.label}</span><button type="button" className={`toggle-switch ${reminder.active ? 'on' : ''}`} aria-label={`${reminder.active ? 'Desactivar' : 'Activar'} ${reminder.label}`} aria-pressed={reminder.active} onClick={() => setReminders((items) => items.map((item) => item.id === reminder.id ? { ...item, active: !item.active } : item))}><i /></button></div>)}<p className="card-footnote">En demo solo cambia la vista; no envía avisos.</p></article>
        <article className="next-visit-card"><span className="section-kicker">SOLICITUD DE CITA</span><h2>Consulta tu salud con un profesional.</h2><p>Esta tarjeta muestra el aspecto de una solicitud, sin una reserva real.</p><div className="visit-status"><span /> Sin cita real</div><Link to="/citas" className="side-link">Explorar solicitudes <ArrowRight size={15} /></Link></article>
        <Link to="/cuenta" className="sign-out-demo">Conectar tu cuenta real <ArrowUpRight size={15} /></Link>
      </aside></div>
    </div>
  )
}

function LivePatientDashboard({ userId, email }: { userId: string; email: string }) {
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [log, setLog] = useState<CareLog | null>(null)
  const [reminders, setReminders] = useState<CareReminder[]>([])
  const [requests, setRequests] = useState<AppointmentRequest[]>([])
  const [label, setLabel] = useState('')
  const [time, setTime] = useState('20:30')
  const [loading, setLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const today = todayLocal()

  async function load() {
    if (!supabase) return
    setLoading(true)
    setError('')
    try {
      const [profileResult, logResult, remindersResult, requestsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('care_logs').select('*').eq('user_id', userId).eq('logged_on', today).maybeSingle(),
        supabase.from('care_reminders').select('*').eq('user_id', userId).order('reminder_time'),
        supabase.from('appointment_requests').select('*').eq('patient_id', userId).order('created_at', { ascending: false }).limit(5),
      ])
      const failure = profileResult.error ?? logResult.error ?? remindersResult.error ?? requestsResult.error
      if (failure) setError(failure.message)
      setProfile(profileResult.data as PatientProfile | null)
      setProfileName((profileResult.data as PatientProfile | null)?.full_name ?? '')
      setProfilePhone((profileResult.data as PatientProfile | null)?.phone ?? '')
      setLog(logResult.data as CareLog | null)
      setReminders((remindersResult.data ?? []) as CareReminder[])
      setRequests((requestsResult.data ?? []) as AppointmentRequest[])
    } catch {
      setError('No pudimos cargar tu información. Comprueba tu conexión e inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [userId, today])

  async function toggleLog(key: 'brushed_morning' | 'brushed_evening' | 'cleaned_between_teeth') {
    if (!supabase) return
    setNotice('')
    const next = { ...(log ?? {}), user_id: userId, logged_on: today, [key]: !log?.[key] }
    const { data, error: saveError } = await supabase.from('care_logs').upsert(next, { onConflict: 'user_id,logged_on' }).select().single()
    if (saveError) setError(saveError.message)
    else setLog(data as CareLog)
  }

  async function addReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !label.trim()) return
    const { error: addError } = await supabase.from('care_reminders').insert({ user_id: userId, label: label.trim(), reminder_time: time, repeat_days: [1, 2, 3, 4, 5, 6, 7] })
    if (addError) setError(addError.message)
    else { setLabel(''); setNotice('Recordatorio guardado. Las notificaciones todavía no están activadas.'); void load() }
  }

  async function removeReminder(id: string) {
    if (!supabase) return
    const { error: deleteError } = await supabase.from('care_reminders').delete().eq('id', id).eq('user_id', userId)
    if (deleteError) setError(deleteError.message)
    else setReminders((current) => current.filter((item) => item.id !== id))
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    const trimmedName = profileName.trim()
    const trimmedPhone = profilePhone.trim()
    if (trimmedName.length < 2 || trimmedName.length > 120) {
      setError('Escribe tu nombre completo (entre 2 y 120 caracteres).')
      return
    }
    setError('')
    setNotice('')
    setProfileSaving(true)
    try {
      const { data, error: profileError } = await supabase.from('profiles').update({ full_name: trimmedName, phone: trimmedPhone || null }).eq('id', userId).select().single()
      if (profileError) throw profileError
      setProfile(data as PatientProfile)
      setNotice('Tus datos de contacto se guardaron correctamente.')
    } catch {
      setError('No pudimos guardar tus datos de contacto. Comprueba tu conexión e inténtalo de nuevo.')
    } finally {
      setProfileSaving(false)
    }
  }

  const displayName = profile?.full_name?.trim() || email.split('@')[0] || 'Hola'
  const checked = [Boolean(log?.brushed_morning), Boolean(log?.cleaned_between_teeth), Boolean(log?.brushed_evening)].filter(Boolean).length
  return (
    <div className="content-wrap portal-page dashboard-page"><div className="dashboard-heading"><div><span className="section-kicker">PORTAL DEL PACIENTE</span><h1>Hola, {displayName}.</h1><p>Tu información está asociada a tu cuenta.</p></div><span className="secure-chip"><ShieldCheck size={16} /> Sesión privada</span></div>
      {error && <FormMessage kind="error">{error}</FormMessage>}{notice && <FormMessage>{notice}</FormMessage>}
      {loading ? <div className="loading-panel">Cargando tu información…</div> : <div className="dashboard-grid"><section className="dashboard-main"><article className="today-card"><div className="today-card-head"><div><span className="section-kicker">TU CUIDADO DE HOY</span><h2>¿Cómo va tu rutina?</h2></div><span className="progress-ring" style={{ '--progress': `${checked * 33.333}%` } as CSSProperties}><span>{checked}/3</span></span></div><div className="today-checks"><HabitCheck label="Cepillado de la mañana" done={Boolean(log?.brushed_morning)} onChange={() => void toggleLog('brushed_morning')} /><HabitCheck label="Limpieza entre los dientes" done={Boolean(log?.cleaned_between_teeth)} onChange={() => void toggleLog('cleaned_between_teeth')} /><HabitCheck label="Cepillado de la noche" done={Boolean(log?.brushed_evening)} onChange={() => void toggleLog('brushed_evening')} /></div><p className="card-footnote">Marca solo los hábitos que realizaste. Puedes editarlos durante el día.</p></article><article className="week-card"><div className="card-heading"><div><span className="section-kicker">PRÓXIMOS PASOS</span><h2>Tus citas</h2></div><CalendarDays size={18} /></div>{requests.length ? requests.map((request) => <div className="request-row" key={request.id}><span className={`request-status status-${request.status}`} /><span>{formatClinicDate(request.requested_date, { day: 'numeric', month: 'long' })}{request.requested_time ? ` · ${request.requested_time.slice(0, 5)}` : ' · hora por confirmar'}</span><span>{request.status === 'requested' ? 'Pendiente de confirmar' : request.status === 'confirmed' ? 'Confirmada por la clínica' : request.status}</span></div>) : <p className="empty-copy">Todavía no tienes solicitudes de cita.</p>}<Link to="/citas" className="side-link">Solicitar una cita <ArrowRight size={15} /></Link></article></section><aside className="dashboard-side"><article className="side-card reminder-card"><div className="card-heading"><div><span className="section-kicker">TUS RECORDATORIOS</span><h2>Momentos para ti</h2></div><Clock3 size={19} /></div>{reminders.length ? reminders.map((item) => <div className="reminder-row" key={item.id}><span className="reminder-time">{item.reminder_time.slice(0, 5)}</span><span className="reminder-label">{item.label}</span><button className="icon-button" type="button" aria-label={`Eliminar ${item.label}`} onClick={() => void removeReminder(item.id)}><Trash2 size={15} /></button></div>) : <p className="empty-copy">Aún no creaste recordatorios.</p>}<form className="reminder-form" onSubmit={addReminder}><input aria-label="Nombre del recordatorio" maxLength={80} placeholder="Ej. Rutina de noche" value={label} onChange={(event) => setLabel(event.target.value)} required /><input aria-label="Hora del recordatorio" type="time" value={time} onChange={(event) => setTime(event.target.value)} required /><button className="add-reminder-button" type="submit"><Plus size={16} /> Añadir</button></form><p className="card-footnote">Los horarios se guardan; aún no envían notificaciones.</p></article><article className="next-visit-card"><span className="section-kicker">ORIENTACIÓN PROFESIONAL</span><h2>¿Necesitas una revisión?</h2><p>Envía una preferencia de fecha para que la clínica la evalúe. La solicitud no es una cita confirmada.</p><Link to="/citas" className="side-link">Solicitar cita <ArrowRight size={15} /></Link></article><article className="side-card profile-card">
  <div className="profile-card-heading">
    <span className="profile-card-avatar"><UserRound size={20} /></span>
    <div className="profile-card-title"><span className="section-kicker">TU ESPACIO PERSONAL</span><h2>Datos de contacto</h2><p>Revisa cómo podemos comunicarnos contigo.</p></div>
    <span className="profile-private-badge"><ShieldCheck size={14} />Privado</span>
  </div>
  <div className="profile-account-email"><span className="profile-email-icon"><Mail size={16} /></span><div><small>Correo de acceso</small><strong title={email}>{email}</strong></div><span className="profile-email-lock"><ShieldCheck size={15} /></span></div>
  <form className="profile-form" onSubmit={saveProfile}>
    <label htmlFor="profile-full-name"><span className="profile-field-heading"><UserRound size={14} /> Nombre completo</span><input id="profile-full-name" autoComplete="name" minLength={2} maxLength={120} value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Tu nombre y apellidos" required /></label>
    <label htmlFor="profile-phone"><span className="profile-field-heading"><Phone size={14} /> Teléfono <span className="profile-optional">Opcional</span></span><input id="profile-phone" autoComplete="tel" maxLength={32} type="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} placeholder="+51 900 000 000" /></label>
    <div className="profile-security-note"><ShieldCheck size={15} /><span>Tu información solo es visible para ti y el personal autorizado de la clínica. Para una cita, puedes indicar un correo de confirmación distinto.</span></div>
    <button className="profile-save-button" type="submit" disabled={profileSaving}>{profileSaving ? <><LoaderCircle size={16} className="profile-save-spinner" />Guardando…</> : <><Check size={16} />Guardar datos de contacto</>}</button>
  </form>
</article></aside></div>}
    </div>
  )
}

export function PatientPage() {
  const { configured, loading, user } = useAuth()
  if (!configured) return <DemoPatientDashboard />
  if (loading) return <div className="content-wrap portal-page"><div className="loading-panel">Comprobando sesión…</div></div>
  if (!user) return <Navigate to="/cuenta" replace />
  return <LivePatientDashboard key={user.id} userId={user.id} email={user.email ?? ''} />
}

function AppointmentBooking({ demo, userId, accountEmail }: { demo: boolean; userId?: string; accountEmail?: string }) {
  const dates = useMemo(() => clinicDates(14), [])
  const seed = useMemo(() => makeDemoSeedBookings(), [])
  const [date, setDate] = useState(dates[0] ?? '')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState<'checkup' | 'bleeding' | 'sensitivity' | 'other'>('checkup')
  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientDni, setPatientDni] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState(accountEmail ?? '')
  const [profileLoading, setProfileLoading] = useState(!demo)
  const [profileReady, setProfileReady] = useState(demo)
  const [profileError, setProfileError] = useState('')
  const [profileRetry, setProfileRetry] = useState(0)
  const [patientNote, setPatientNote] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [consent, setConsent] = useState(false)
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<DemoBooking | null>(null)
  const [requestId, setRequestId] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const [emailMessage, setEmailMessage] = useState('')

  useEffect(() => {
    if (!demo) setConfirmationEmail(accountEmail ?? '')
  }, [accountEmail, demo])

  useEffect(() => {
    if (demo) return
    if (!supabase || !userId) {
      setProfileError('Inicia sesión para cargar tus datos antes de solicitar una cita.')
      setProfileLoading(false)
      return
    }
    let active = true
    setProfileLoading(true)
    void (async () => {
      try {
        const { data, error: queryError } = await supabase.from('profiles').select('full_name, age, dni').eq('id', userId).maybeSingle()
        if (!active) return
        if (queryError || !data) {
          setProfileError('No pudimos cargar tus datos. Comprueba que la migración de identidad 004 esté aplicada en Supabase e inténtalo de nuevo.')
          return
        }
        setPatientName(data.full_name ?? '')
        setPatientAge(data.age == null ? '' : String(data.age))
        setPatientDni(data.dni ?? '')
        setProfileReady(true)
        setProfileError('')
      } catch {
        if (active) setProfileError('No pudimos cargar tus datos. Comprueba tu conexión e inténtalo de nuevo.')
      } finally {
        if (active) setProfileLoading(false)
      }
    })()
    return () => { active = false }
  }, [demo, userId, profileRetry])

  useEffect(() => {
    if (!date) return
    let active = true
    setTime('')
    setError('')
    if (demo) {
      const bookings = readDemoBookings(seed)
      setBookedTimes(bookings.filter((booking) => booking.date === date && booking.status !== 'cancelled').map((booking) => booking.time))
      return () => { active = false }
    }
    if (!supabase) return
    setLoadingSlots(true)
    void (async () => {
      try {
        const { data, error: availabilityError } = await supabase.rpc('get_booked_appointment_times', { p_requested_date: date })
        if (!active) return
        if (availabilityError) {
          setBookedTimes(clinicSlots(date))
          setError('No pudimos consultar la disponibilidad. Asegúrate de aplicar la migración de horarios en Supabase y vuelve a intentarlo.')
        } else {
          setBookedTimes((data ?? []).map((row: { requested_time: string }) => row.requested_time.slice(0, 5)))
        }
      } catch {
        if (!active) return
        setBookedTimes(clinicSlots(date))
        setError('No pudimos consultar la disponibilidad. Comprueba tu conexión e inténtalo de nuevo.')
      } finally {
        if (active) setLoadingSlots(false)
      }
    })()
    return () => { active = false }
  }, [date, demo, retry, seed])

  const availableTimes = clinicSlots(date).filter((slot) => !bookedTimes.includes(slot))

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    if (!selected.length) return
    if (photos.length + selected.length > MAX_APPOINTMENT_PHOTOS) {
      setError(`Puedes adjuntar hasta ${MAX_APPOINTMENT_PHOTOS} fotos por solicitud.`)
      return
    }
    const invalid = selected.find((file) => !ALLOWED_APPOINTMENT_PHOTO_TYPES.includes(file.type) || file.size > MAX_APPOINTMENT_PHOTO_BYTES || file.size === 0)
    if (invalid) {
      setError('Usa fotos JPG, PNG o WebP de hasta 5 MB cada una.')
      return
    }
    setError('')
    setPhotos((current) => [...current, ...selected])
  }

  async function sendConfirmationEmail(id: string) {
    if (!supabase || !id) return
    setEmailStatus('sending')
    setEmailMessage('Enviando el correo de confirmación…')
    try {
      const { data, error: emailError } = await supabase.functions.invoke('send-appointment-confirmation', { body: { requestId: id } })
      if (emailError || !data?.sent) throw new Error('send failed')
      setEmailStatus('sent')
      setEmailMessage(`Enviamos un correo de recepción a ${confirmationEmail.trim()}.`)
    } catch {
      setEmailStatus('failed')
      setEmailMessage('La solicitud quedó guardada, pero el correo no se envió. Puedes reintentarlo.')
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!date || !time || (!demo && !consent)) return
    if (!demo) {
      const trimmedName = patientName.trim()
      const numericAge = Number(patientAge)
      const trimmedEmail = confirmationEmail.trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 254) {
        setError('Escribe un correo válido para recibir la confirmación.')
        return
      }
      if (trimmedName.length < 2 || trimmedName.length > 120) {
        setError('Escribe tu nombre completo (entre 2 y 120 caracteres).')
        return
      }
      if (!patientAge || !Number.isInteger(numericAge) || numericAge < 0 || numericAge > 120) {
        setError('Escribe una edad válida entre 0 y 120 años.')
        return
      }
      if (patientDni && !/^\d{8}$/.test(patientDni)) {
        setError('El DNI debe tener 8 dígitos. También puedes dejarlo vacío.')
        return
      }
      if (!profileReady || profileLoading || profileError) {
        setError(profileError || 'Espera a que carguemos los datos de tu perfil.')
        return
      }
    }
    setBusy(true)
    setError('')
    if (demo) {
      const currentBookings = readDemoBookings(seed)
      if (currentBookings.some((booking) => booking.date === date && booking.time === time && booking.status !== 'cancelled')) {
        setBookedTimes(currentBookings.filter((booking) => booking.date === date && booking.status !== 'cancelled').map((booking) => booking.time))
        setTime('')
        setError('Ese horario acaba de ocuparse. Elige otro espacio disponible.')
        setBusy(false)
        return
      }
      const nextBooking: DemoBooking = {
        id: `demo-${Date.now()}`,
        patient: 'Paciente de demostración',
        date,
        time,
        reason: reason === 'checkup' ? 'Control preventivo' : reason === 'bleeding' ? 'Sangrado de encías' : reason === 'sensitivity' ? 'Sensibilidad' : 'Otra consulta',
        status: 'requested',
      }
      writeDemoBookings([...currentBookings, nextBooking])
      setConfirmation(nextBooking)
      setBookedTimes((current) => [...current, time])
      setBusy(false)
      return
    }
    if (!supabase || !userId) { setBusy(false); return }
    try {
      const { error: saveProfileError } = await supabase.from('profiles').update({
        full_name: patientName.trim(),
        age: Number(patientAge),
        dni: patientDni || null,
      }).eq('id', userId)
      if (saveProfileError) throw saveProfileError
    } catch {
      setError('No pudimos guardar tus datos. Comprueba que la migración de identidad 004 esté aplicada en Supabase e inténtalo de nuevo.')
      setBusy(false)
      return
    }
    const id = crypto.randomUUID()
    const acceptedAt = new Date().toISOString()
    let requestError: { code?: string } | null = null
    try {
      const result = await supabase.from('appointment_requests').insert({
        id,
        patient_id: userId,
        requested_date: date,
        requested_time: time,
        preferred_period: Number(time.slice(0, 2)) < 13 ? 'morning' : 'afternoon',
        reason_code: reason,
        patient_note: patientNote.trim() || null,
        confirmation_email: confirmationEmail.trim(),
        consent_accepted_at: acceptedAt,
        privacy_notice_version: 'v4',
        sensitive_data_consent_at: acceptedAt,
        sensitive_data_notice_version: 'v4',
      })
      requestError = result.error
    } catch {
      setError('No pudimos contactar con la agenda. Comprueba tu conexión e inténtalo de nuevo.')
      setBusy(false)
      return
    }
    if (requestError?.code === '23505') {
      setBookedTimes((current) => [...current, time])
      setTime('')
      setError('Ese horario acaba de ser reservado por otra persona. Elige una hora disponible.')
      setBusy(false)
      return
    }
    if (requestError?.code === '42501' || requestError?.code === '23514') {
      setBookedTimes((current) => [...new Set([...current, time])])
      setTime('')
      setError('Ese horario ya no está disponible o quedó demasiado próximo. Elige otra hora.')
      setBusy(false)
      return
    }
    if (requestError) {
      setError('No pudimos guardar la solicitud. Comprueba que las migraciones de citas estén aplicadas y vuelve a intentarlo.')
      setBusy(false)
      return
    }

    const uploadedPaths: string[] = []
    try {
      const attachmentRows: Omit<AppointmentAttachment, 'id' | 'created_at'>[] = []
      for (const [index, file] of photos.entries()) {
        const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
        const path = `${userId}/${id}/${index + 1}-${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('appointment-photos').upload(path, file, { contentType: file.type, upsert: false })
        if (uploadError) throw new Error(uploadError.message)
        uploadedPaths.push(path)
        attachmentRows.push({ appointment_request_id: id, owner_id: userId, storage_path: path, mime_type: file.type as AppointmentAttachment['mime_type'], file_size_bytes: file.size })
      }
      if (attachmentRows.length) {
        const { error: metadataError } = await supabase.from('appointment_attachments').insert(attachmentRows)
        if (metadataError) throw new Error(metadataError.message)
      }
    } catch {
      try {
        if (uploadedPaths.length) await supabase.storage.from('appointment-photos').remove(uploadedPaths)
        await supabase.from('appointment_requests').delete().eq('id', id).eq('patient_id', userId)
      } catch {
        // Keep the original upload error visible; cleanup is best effort when the network is down.
      }
      setError('No pudimos guardar todas las fotos. No se envió la solicitud; revisa los formatos permitidos y vuelve a intentarlo.')
      setBusy(false)
      return
    }

    const confirmedRequest: DemoBooking = { id, patient: 'Tú', date, time, reason: 'Solicitud enviada', status: 'requested' }
    setRequestId(id)
    setConfirmation(confirmedRequest)
    setPhotos([])
    setPatientNote('')
    setBusy(false)
    await sendConfirmationEmail(id)
  }

  function clearConfirmation() {
    setConfirmation(null)
    setRequestId('')
    setEmailStatus('idle')
    setEmailMessage('')
    setTime('')
    setConsent(false)
  }

  return <div className="content-wrap portal-page">
    {demo && <DemoBanner />}
    <div className="booking-layout">
      <div className="booking-intro">
        <span className="section-kicker">{demo ? 'CLÍNICA DE DEMOSTRACIÓN' : 'SOLICITUD DE CITA'}</span>
        <h1>Elige el día y la hora que te convienen.</h1>
        <p>Solicita una atención en Perioalert Trujillo. La clínica revisará la solicitud y confirmará la cita contigo.</p>
        <section className="clinic-profile-card" aria-label="Información de la clínica">
          <div className="clinic-profile-heading"><span className="clinic-avatar"><MapPin size={20} /></span><div><strong>Perioalert · Clínica de demostración</strong><span>Trujillo, La Libertad, Perú · ubicación simulada</span></div></div>
          <div className="clinic-info-row"><Clock3 size={16} /><span><b>Lun–Vie</b> 9:00–13:00 y 15:00–18:00<br /><b>Sábado</b> 9:00–13:00 · Domingo cerrado</span></div>
          <p>{demo ? 'Agenda y pacientes ficticios para que puedas probar el flujo.' : 'Estos horarios son de demostración; reemplázalos por la agenda real antes de aceptar pacientes.'}</p>
        </section>
        <div className="booking-trust"><ShieldCheck size={17} />{demo ? 'La demo no solicita datos personales ni contacta a la clínica.' : 'Tu solicitud queda asociada a tu cuenta; no incluyas detalles médicos.'}</div>
      </div>
      <form className="booking-card" onSubmit={submit}>
        <div className="booking-form-heading"><div><span className="section-kicker">{confirmation ? 'RESUMEN' : 'PASO 1 DE 3 · FECHA'}</span><h2>{confirmation ? (demo ? 'Horario reservado en la demo' : 'Solicitud enviada') : 'Selecciona un día'}</h2></div><span className="booking-step">{confirmation ? <CheckCircle2 size={19} /> : <CalendarDays size={19} />}</span></div>
        {confirmation ? <div className="booking-confirmation" role="status">
          <span className="confirmation-check"><CheckCircle2 size={23} /></span>
          <strong>{formatClinicDate(confirmation.date, { weekday: 'long', day: 'numeric', month: 'long' })} · {confirmation.time}</strong>
          <p>{demo ? 'La reserva de prueba se guardó en este navegador y aparecerá en el panel de clínica demo.' : 'Estado: pendiente de confirmación por parte de la clínica.'}</p>
          {!demo && <div className={`booking-email-notice ${emailStatus === 'failed' ? 'failed' : ''}`} role="status"><span>{emailStatus === 'sent' ? <CheckCircle2 size={16} /> : emailStatus === 'failed' ? <ShieldCheck size={16} /> : <Clock3 size={16} />}{emailMessage}</span>{emailStatus === 'failed' && <button type="button" onClick={() => void sendConfirmationEmail(requestId)}>Reintentar correo</button>}</div>}
          <button className="button button-secondary full-button" type="button" onClick={clearConfirmation}>Elegir otro horario</button>
        </div> : <>
          <fieldset className="booking-date-fieldset"><legend>Día de atención · hora local de Trujillo</legend><div className="booking-date-grid">{dates.map((option) => <button className={`booking-date-option ${date === option ? 'selected' : ''}`} type="button" key={option} aria-pressed={date === option} onClick={() => { setDate(option); setError('') }}><span>{formatClinicDate(option, { weekday: 'short' })}</span><strong>{formatClinicDate(option, { day: 'numeric' })}</strong><small>{formatClinicDate(option, { month: 'short' })}</small></button>)}</div></fieldset>
          <fieldset className="booking-time-fieldset"><legend><span>Paso 2 · Elige una hora</span><small>{date ? formatClinicDate(date, { weekday: 'long', day: 'numeric', month: 'long' }) : ''}</small></legend>
            {loadingSlots ? <div className="slot-message">Buscando horarios disponibles…</div> : error && !availableTimes.length ? <div className="slot-message slot-error">{error}<button type="button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button></div> : availableTimes.length ? <div className="booking-time-grid">{availableTimes.map((slot) => <button className={`booking-time-option ${time === slot ? 'selected' : ''}`} type="button" key={slot} aria-pressed={time === slot} onClick={() => { setTime(slot); setError('') }}><Clock3 size={14} />{slot}</button>)}</div> : <div className="slot-message">No quedan horas para este día. Prueba con otra fecha.</div>}
          </fieldset>
          {!demo && <section className="booking-personal-fields" aria-labelledby="booking-personal-heading">
            <div className="booking-personal-heading"><div><span className="section-kicker">TUS DATOS</span><h3 id="booking-personal-heading">¿A nombre de quién solicitamos?</h3></div><ShieldCheck size={19} aria-hidden="true" /></div>
            {profileLoading && <p className="profile-load-note" role="status">Cargando los datos guardados de tu cuenta…</p>}
            {profileError && <div className="profile-error-row"><FormMessage kind="error">{profileError}</FormMessage><button className="profile-retry-button" type="button" onClick={() => setProfileRetry((value) => value + 1)}>Reintentar carga</button></div>}
            <label className="booking-card-label">Nombre completo<input autoComplete="name" type="text" minLength={2} maxLength={120} value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="Como aparece en tu documento" required /></label>
            <label className="booking-card-label">Correo para la confirmación<input autoComplete="email" type="email" maxLength={254} value={confirmationEmail} onChange={(event) => setConfirmationEmail(event.target.value)} placeholder="tu@correo.com" required /><span className="profile-load-note">Precargamos el correo de tu cuenta; puedes cambiarlo para esta solicitud.</span></label>
            <div className="booking-identity-grid">
              <label className="booking-card-label">Edad<input autoComplete="off" type="number" min={0} max={120} step={1} inputMode="numeric" value={patientAge} onChange={(event) => setPatientAge(event.target.value)} placeholder="Ej. 28" required /></label>
              <label className="booking-card-label">DNI <span className="optional-label">Opcional · 8 dígitos</span><input autoComplete="off" type="text" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} value={patientDni} onChange={(event) => setPatientDni(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="Ej. 01234567" /></label>
            </div>
            <p className="profile-data-note">Estos datos se guardarán en tu perfil para futuras solicitudes. El DNI es opcional mientras la clínica confirma si lo necesita.</p>
          </section>}
          <label className="booking-card-label">Motivo general<select value={reason} onChange={(event) => setReason(event.target.value as typeof reason)}><option value="checkup">Control preventivo</option><option value="bleeding">Sangrado de encías</option><option value="sensitivity">Sensibilidad</option><option value="other">Otra consulta</option></select></label>
          {!demo ? <>
            <label className="booking-card-label">Cuéntanos cómo te sientes <span className="optional-label">Opcional · hasta 1500 caracteres</span><textarea rows={4} maxLength={1500} value={patientNote} onChange={(event) => setPatientNote(event.target.value)} placeholder="Describe brevemente qué te preocupa o desde cuándo lo notas. Evita incluir datos que no hagan falta." /></label>
            <div className="appointment-upload"><div><strong>Fotos de apoyo</strong><span>Opcional · JPG, PNG o WebP · hasta 3 fotos de 5 MB</span></div><label className="appointment-upload-button"><ImagePlus size={17} />Adjuntar fotos<input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectPhotos} disabled={photos.length >= MAX_APPOINTMENT_PHOTOS} /></label>{photos.length > 0 && <div className="appointment-photo-list">{photos.map((file, index) => <PhotoPreview key={`${file.name}-${file.lastModified}-${index}`} file={file} onRemove={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} />)}</div>}</div>
            <label className="consent-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>Acepto compartir mi nombre, edad, correo, DNI (si lo proporciono), motivo, descripción y fotos con la clínica para gestionar esta solicitud y enviarme la confirmación al correo indicado. He leído el <Link to="/privacidad" target="_blank" rel="noreferrer">aviso de privacidad</Link>. La cita queda pendiente de confirmación.</span></label>
          </> : <div className="private-intake-prompt"><ShieldCheck size={17} /><span>Por seguridad, las fotos y la descripción solo se pueden adjuntar desde una sesión autenticada.</span><Link to="/cuenta">Iniciar sesión o crear cuenta <ArrowRight size={14} /></Link></div>}
          {error && <FormMessage kind="error">{error}</FormMessage>}
          <button className="button button-primary full-button" type="submit" disabled={busy || loadingSlots || !time || (!demo && (!consent || profileLoading || !profileReady || Boolean(profileError)))}>{busy ? 'Guardando…' : demo ? 'Simular mi cita' : 'Solicitar este horario'} <ArrowRight size={16} /></button>
          <p className="card-footnote">{demo ? 'Solo se guarda la fecha y la hora ficticias en este navegador.' : 'La solicitud no es una cita confirmada hasta que la clínica responda.'}</p>
        </>}
      </form>
    </div>
  </div>
}

export function AppointmentPage() {
  const { configured, loading, user } = useAuth()
  if (!configured) return <AppointmentAccess />
  if (loading) return <div className="content-wrap portal-page"><div className="loading-panel">Comprobando sesión…</div></div>
  if (!user) return <AppointmentAccess />
  return <AppointmentBooking demo={false} userId={user.id} accountEmail={user.email ?? ''} />
}

function AppointmentAccess() {
  const { configured } = useAuth()
  return <div className="content-wrap portal-page appointment-access-page">
    {!configured && <DemoBanner />}
    <section className="appointment-access-card">
      <span className="section-kicker">AGENDA PRIVADA</span>
      <h1>Inicia sesión para solicitar una cita.</h1>
      <p>Las solicitudes y los datos que compartas deben quedar asociados a tu cuenta para que puedas consultarlos de forma privada.</p>
      <Link className="button button-primary" to="/cuenta" state={{ from: '/citas' }}>Iniciar sesión o crear cuenta <ArrowRight size={17} /></Link>
      {!configured && <p className="card-footnote">La conexión de cuentas todavía está en modo demostración.</p>}
    </section>
  </div>
}

function DemoClinicDashboard() {
  const [rows, setRows] = useState(() => readDemoBookings(demoAppointments))
  const pending = rows.filter((row) => row.status === 'requested').length
  function setDemoStatus(id: string, status: DemoBooking['status']) {
    setRows((current) => {
      const next = current.map((row) => row.id === id ? { ...row, status } : row)
      writeDemoBookings(next)
      return next
    })
  }
  return <div className="content-wrap portal-page clinic-page">
    <DemoBanner />
    <div className="dashboard-heading"><div><span className="section-kicker">ESPACIO DE CLÍNICA · TRUJILLO</span><h1>Agenda de demostración.</h1><p>Datos ficticios para explorar la gestión de una clínica periodontal.</p></div><span className="secure-chip demo-secure"><Users size={16} /> Sin datos reales</span></div>
    <section className="clinic-profile-card clinic-dashboard-profile"><div className="clinic-profile-heading"><span className="clinic-avatar"><MapPin size={20} /></span><div><strong>Perioalert · Salud periodontal</strong><span>Trujillo, La Libertad, Perú · Ubicación simulada</span></div></div><div className="clinic-info-row"><Clock3 size={16} /><span><b>Lun–Vie</b> 9:00–13:00 y 15:00–18:00 · <b>Sábado</b> 9:00–13:00 · Domingo cerrado</span></div></section>
    <div className="clinic-stats"><article><span>Solicitudes de ejemplo</span><b>{rows.filter((row) => row.status !== 'cancelled').length}</b><small>Reservas activas</small></article><article><span>Pendientes de revisar</span><b>{pending}</b><small>Esperan confirmación</small></article><article><span>Estado del sistema</span><b className="demo-live">DEMO</b><small>La agenda real requiere Supabase</small></article></div>
    <section className="clinic-table-card"><div className="card-heading"><div><span className="section-kicker">BANDEJA DE SOLICITUDES</span><h2>Próximas citas</h2></div><CalendarDays size={19} /></div>
      {rows.length ? <div className="clinic-table-wrap" role="region" tabIndex={0} aria-label="Agenda de citas; desliza horizontalmente para ver más columnas"><p className="clinic-table-hint">En celular, desliza la tabla para ver todas las columnas.</p><table className="clinic-table"><thead><tr><th>Paciente</th><th>Fecha</th><th>Hora</th><th>Motivo general</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.patient}<small>Registro ficticio</small></td><td>{formatClinicDate(row.date, { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>{row.time}</td><td>{row.reason}</td><td><span className={`status-pill ${row.status}`}>{row.status === 'requested' ? 'Pendiente' : row.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}</span></td><td>{row.status === 'requested' ? <><button className="table-action" type="button" onClick={() => setDemoStatus(row.id, 'confirmed')}>Confirmar</button><button className="table-action subtle-action" type="button" onClick={() => setDemoStatus(row.id, 'cancelled')}>Cancelar</button></> : row.status === 'confirmed' ? <button className="table-action subtle-action" type="button" onClick={() => setDemoStatus(row.id, 'cancelled')}>Cancelar cita</button> : <span className="card-footnote">Horario liberado</span>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><CalendarDays size={25} /><h3>La agenda está vacía</h3><p>Las citas simuladas que solicites aparecerán aquí.</p><Link to="/citas" className="side-link">Crear cita de prueba <ArrowRight size={15} /></Link></div>}
      <p className="card-footnote">Los cambios se guardan solo en este navegador; no se envían mensajes ni se contacta con pacientes.</p>
    </section>
    <div className="clinic-footer-note"><ShieldCheck size={17} /><span>Este panel es una simulación. Activa roles de clínica y aplica las migraciones para usarlo con cuentas reales.</span><Link to="/cuenta">Configurar acceso <ArrowRight size={15} /></Link></div>
  </div>
}

interface ClinicRequestRow extends AppointmentRequest {
  profile?: PatientProfile | null
  attachments?: Array<{ id: string; signedUrl: string }>
}

function LiveClinicDashboard() {
  const [rows, setRows] = useState<ClinicRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'requested' | 'confirmed'>('all')

  async function load() {
    if (!supabase) return
    setLoading(true)
    const { data, error: queryError } = await supabase.from('appointment_requests').select('*').order('requested_date')
    if (queryError) { setError(queryError.message); setLoading(false); return }
    const requests = (data ?? []) as AppointmentRequest[]
    const ids = [...new Set(requests.map((item) => item.patient_id))]
    const requestIds = requests.map((item) => item.id)
    const [{ data: profiles }, { data: attachments, error: attachmentError }] = await Promise.all([
      ids.length ? supabase.from('profiles').select('*').in('id', ids) : Promise.resolve({ data: [] }),
      requestIds.length ? supabase.from('appointment_attachments').select('*').in('appointment_request_id', requestIds) : Promise.resolve({ data: [], error: null }),
    ])
    if (attachmentError) setError('No pudimos cargar las fotos adjuntas. Comprueba los permisos de Storage de la migración.')
    const profileMap = new Map(((profiles ?? []) as PatientProfile[]).map((item) => [item.id, item]))
    const attachmentRows = (attachments ?? []) as AppointmentAttachment[]
    const attachmentsWithUrls = await Promise.all(attachmentRows.map(async (item) => {
      const { data: signed, error: signedError } = await supabase!.storage.from('appointment-photos').createSignedUrl(item.storage_path, 1800)
      return signedError || !signed ? null : { ...item, signedUrl: signed.signedUrl }
    }))
    const attachmentsMap = new Map<string, Array<{ id: string; signedUrl: string }>>()
    attachmentsWithUrls.filter((item): item is AppointmentAttachment & { signedUrl: string } => Boolean(item)).forEach((item) => {
      attachmentsMap.set(item.appointment_request_id, [...(attachmentsMap.get(item.appointment_request_id) ?? []), { id: item.id, signedUrl: item.signedUrl }])
    })
    setRows(requests.map((item) => ({ ...item, profile: profileMap.get(item.patient_id) ?? null, attachments: attachmentsMap.get(item.id) ?? [] })))
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function setStatus(id: string, status: RequestStatus) {
    if (!supabase) return
    const { error: updateError } = await supabase.from('appointment_requests').update({ status }).eq('id', id)
    if (updateError) setError(updateError.message)
    else setRows((current) => current.map((item) => item.id === id ? { ...item, status } : item))
  }

  const visibleRows = useMemo(() => rows.filter((item) => filter === 'all' || item.status === filter), [rows, filter])
  const pending = rows.filter((item) => item.status === 'requested').length
  return <div className="content-wrap portal-page clinic-page">
    <div className="dashboard-heading"><div><span className="section-kicker">ESPACIO DE CLÍNICA · TRUJILLO</span><h1>Gestión de citas.</h1><p>Revisa horarios, confirma solicitudes y libera citas si hace falta.</p></div><span className="secure-chip"><ShieldCheck size={16} /> Acceso autorizado</span></div>
    {error && <FormMessage kind="error">{error}</FormMessage>}
    <div className="clinic-stats"><article><span>Solicitudes activas</span><b>{rows.filter((item) => item.status !== 'cancelled').length}</b><small>Horarios ocupados</small></article><article><span>Pendientes</span><b>{pending}</b><small>Esperan confirmación</small></article><article><span>Próximas fechas</span><b>{rows.filter((item) => item.requested_date >= clinicToday()).length}</b><small>Hora local de Trujillo</small></article></div>
    <section className="clinic-table-card">
      <div className="card-heading"><div><span className="section-kicker">AGENDA</span><h2>Solicitudes por horario</h2></div><div className="clinic-table-controls"><select className="filter-select" aria-label="Filtrar solicitudes" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Todas</option><option value="requested">Pendientes</option><option value="confirmed">Confirmadas</option></select><button className="table-action" type="button" onClick={() => void load()}>Actualizar</button></div></div>
    {loading ? <div className="loading-panel">Cargando solicitudes…</div> : visibleRows.length === 0 ? <div className="empty-state"><CalendarDays size={25} /><h3>No hay solicitudes en esta vista</h3><p>Las nuevas solicitudes aparecerán aquí cuando un paciente elija un horario.</p></div> : <div className="clinic-table-wrap" role="region" tabIndex={0} aria-label="Agenda de citas; desliza horizontalmente para ver más columnas"><p className="clinic-table-hint">En celular, desliza la tabla para ver todas las columnas.</p><table className="clinic-table clinic-table-live"><thead><tr><th>Paciente y correo</th><th>Edad y DNI</th><th>Fecha</th><th>Hora</th><th>Motivo</th><th>Descripción</th><th>Fotos privadas</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id}><td>{row.profile?.full_name || 'Paciente'}<small>{row.confirmation_email ? `Correo: ${row.confirmation_email}` : 'Sin correo de confirmación'}</small>{row.profile?.phone && <small>Teléfono: {row.profile.phone}</small>}</td><td>{row.profile?.age == null ? 'Sin edad' : `${row.profile.age} años`}{row.profile?.dni && <details className="appointment-note-details"><summary>Ver DNI</summary><p>{row.profile.dni}</p></details>}</td><td>{formatClinicDate(row.requested_date, { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>{row.requested_time?.slice(0, 5) ?? 'Sin hora'}</td><td>{row.reason_code === 'checkup' ? 'Control preventivo' : row.reason_code === 'bleeding' ? 'Sangrado de encías' : row.reason_code === 'sensitivity' ? 'Sensibilidad' : 'Otra consulta'}</td><td>{row.patient_note ? <details className="appointment-note-details"><summary>Leer nota</summary><p>{row.patient_note}</p></details> : '—'}</td><td><div className="clinic-attachments">{row.attachments?.map((attachment) => <a key={attachment.id} href={attachment.signedUrl} target="_blank" rel="noreferrer" aria-label="Abrir foto privada adjunta"><img src={attachment.signedUrl} alt="Foto adjunta a la solicitud" /></a>)}</div>{!row.attachments?.length && '—'}</td><td><span className={`status-pill ${row.status}`}>{row.status === 'requested' ? 'Pendiente' : row.status === 'confirmed' ? 'Confirmada' : row.status === 'completed' ? 'Completada' : 'Cancelada'}</span></td><td>{row.status === 'requested' ? <><button className="table-action" type="button" onClick={() => void setStatus(row.id, 'confirmed')}>Confirmar</button><button className="table-action subtle-action" type="button" onClick={() => void setStatus(row.id, 'cancelled')}>Cancelar</button></> : row.status === 'confirmed' ? <><button className="table-action" type="button" onClick={() => void setStatus(row.id, 'completed')}>Completar</button><button className="table-action subtle-action" type="button" onClick={() => void setStatus(row.id, 'cancelled')}>Liberar hora</button></> : '—'}</td></tr>)}</tbody></table></div>}
    </section>
    <div className="clinic-footer-note"><ShieldCheck size={17} /><span>Las horas confirmadas y pendientes permanecen ocupadas. Al cancelar una solicitud, el horario vuelve a estar disponible.</span></div>
  </div>
}

export function ClinicPage() {
  const { configured, loading, roleLoading, user, isClinicAdmin } = useAuth()
  if (!configured) return <DemoClinicDashboard />
  if (loading || (user && roleLoading)) return <div className="content-wrap portal-page"><div className="loading-panel">Comprobando permisos…</div></div>
  if (!user) return <DemoClinicDashboard />
  if (!isClinicAdmin) return <div className="content-wrap portal-page"><div className="empty-state access-denied"><ShieldCheck size={29} /><h1>Acceso restringido</h1><p>Tu cuenta no tiene el rol de administración de clínica.</p><Link to="/mi-salud">Volver a mi espacio <ArrowRight size={16} /></Link></div></div>
  return <LiveClinicDashboard />
}

export function SignOutButton() {
  const { configured, user } = useAuth()
  const navigate = useNavigate()
  if (!configured || !user) return null
  return <button className="sign-out-button" type="button" onClick={async () => { await supabase?.auth.signOut(); navigate('/') }}><LogOut size={15} /> Cerrar sesión</button>
}
