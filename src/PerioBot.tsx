import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, AudioLines, ImagePlus, Mic, Send, ShieldCheck, Sparkles, Stethoscope, X } from 'lucide-react'

type ChatAttachment = { file: File; url: string }
type ChatMessage = { id: number; role: 'bot' | 'user'; text: string; attachments?: ChatAttachment[] }
type MealPreferences = { breakfast: string; lunch: string; dinner: string; delayMinutes: number }

const MEAL_PREFERENCES_KEY = 'perioalert:meal-reminders:v1'
const defaultMealPreferences: MealPreferences = { breakfast: '08:00', lunch: '13:00', dinner: '20:00', delayMinutes: 30 }
let reminderAudioContext: AudioContext | null = null

function activateReminderSound() {
  try {
    const AudioContextConstructor = window.AudioContext
    if (!AudioContextConstructor) return
    reminderAudioContext ??= new AudioContextConstructor()
    void reminderAudioContext.resume().catch(() => undefined)
  } catch {
    // El navegador puede no ofrecer audio web.
  }
}

function readMealPreferences(): MealPreferences | null {
  try {
    const stored = window.localStorage.getItem(MEAL_PREFERENCES_KEY)
    if (!stored) return null
    const value = JSON.parse(stored) as Partial<MealPreferences>
    if (![value.breakfast, value.lunch, value.dinner].every((time) => typeof time === 'string' && /^\d{2}:\d{2}$/.test(time))) return null
    if (![15, 30, 45, 60, 90, 120].includes(Number(value.delayMinutes))) return null
    return { breakfast: value.breakfast!, lunch: value.lunch!, dinner: value.dinner!, delayMinutes: Number(value.delayMinutes) }
  } catch {
    return null
  }
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function PerioReminderScheduler() {
  const [reminderMessage, setReminderMessage] = useState('')

  useEffect(() => {
    function playReminderSound() {
      try {
        const AudioContextConstructor = window.AudioContext
        if (!AudioContextConstructor) return
        reminderAudioContext ??= new AudioContextConstructor()
        const context = reminderAudioContext
        void context.resume().then(() => {
          const oscillator = context.createOscillator()
          const volume = context.createGain()
          oscillator.type = 'sine'
          oscillator.frequency.value = 880
          volume.gain.setValueAtTime(0.0001, context.currentTime)
          volume.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.03)
          volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.75)
          oscillator.connect(volume)
          volume.connect(context.destination)
          oscillator.start()
          oscillator.stop(context.currentTime + 0.8)
        }).catch(() => undefined)
      } catch {
        // El aviso visual sigue disponible si el navegador no permite reproducir audio.
      }
    }

    function checkScheduledReminders() {
      const preferences = readMealPreferences()
      if (!preferences) return
      const now = new Date()
      const meals = [
        ['Desayuno', preferences.breakfast],
        ['Almuerzo', preferences.lunch],
        ['Cena', preferences.dinner],
      ] as const
      meals.forEach(([meal, time]) => {
        const [hours, minutes] = time.split(':').map(Number)
        const due = new Date(now)
        due.setHours(hours, minutes + preferences.delayMinutes, 0, 0)
        const minutesLate = (now.getTime() - due.getTime()) / 60000
        if (minutesLate < 0 || minutesLate > 20) return
        const key = `perioalert:reminder-sent:${localDateKey(now)}:${meal}`
        if (window.localStorage.getItem(key)) return
        window.localStorage.setItem(key, 'sent')
        const message = `Han pasado ${preferences.delayMinutes} minutos desde tu ${meal.toLowerCase()}. Tómate dos minutos para cepillarte.`
        setReminderMessage(message)
        playReminderSound()
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('Perioalert · hora de cepillarte', { body: message, icon: '/images/perioalert-icon.png', silent: false })
          notification.onclick = () => { window.focus(); notification.close() }
        }
      })
    }

    checkScheduledReminders()
    const timer = window.setInterval(checkScheduledReminders, 15000)
    const onVisibilityChange = () => { if (document.visibilityState === 'visible') checkScheduledReminders() }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  if (!reminderMessage) return null
  return <aside className="perio-reminder-toast" role="status"><Sparkles size={18} /><span>{reminderMessage}</span><button type="button" aria-label="Cerrar recordatorio" onClick={() => setReminderMessage('')}>×</button></aside>
}

const topicWords = /enc[ií]a|periodont|gingivit|diente|dental|odont|boca|cepill|hilo dental|sangra|sangrado|placa|sarro|mal aliento|higiene bucal|sensibilidad|limpieza interdental|pr[oó]tesis|implante|caries|enjuague|fl[uú]or|muelas|dolor de muela/i

function answerFor(question: string) {
  const text = question.toLocaleLowerCase('es')
  if (!topicWords.test(text)) return 'Puedo ayudarte únicamente con salud periodontal, encías e higiene bucal. ¿Qué duda tienes sobre esos temas?'
  if (/foto|imagen|adjunt|audio|nota de voz/.test(text)) return 'Puedo recibir la imagen o el audio como referencia, pero no puedo analizarlos ni diagnosticar a partir de ellos. Si notas sangrado, dolor, inflamación o un cambio que te preocupe, consulta con un odontólogo. Puedes revisar las señales que conviene consultar.'
  if (/sangr|inflam|hinch|dolor|pus|movilidad|se mueve|recesi[oó]n/.test(text)) return 'El sangrado, la inflamación, el dolor o los cambios en la posición de un diente merecen atención. No permiten confirmar una causa por chat; agenda una evaluación odontológica, especialmente si persisten o empeoran.'
  if (/periodont|gingivit|qu[eé] es/.test(text)) return 'La gingivitis es inflamación de las encías y puede causar enrojecimiento o sangrado. La periodontitis puede afectar los tejidos y el hueso que sostienen los dientes. Solo un profesional puede evaluar cuál es tu caso. Revisa nuestra guía sobre periodontitis.'
  if (/cepill|rutina|higiene|hilo dental|interdental|limpiar/.test(text)) return 'Como orientación general, cepíllate con suavidad durante dos minutos, dos veces al día, con pasta dental con flúor. Limpia entre los dientes a diario con hilo o un limpiador interdental que te resulte adecuado. Tu odontólogo puede adaptar estos pasos a tus necesidades.'
  if (/consulta|odont[oó]logo|cita|profesional|cu[aá]ndo/.test(text)) return 'Un odontólogo puede revisar tus encías y recomendarte el cuidado apropiado. En Perioalert puedes ver señales de alerta y consultar los horarios disponibles para una cita.'
  return 'Puedo compartir información educativa sobre encías, enfermedad periodontal e higiene bucal. Cuéntame un poco más de tu pregunta. Esta orientación no sustituye una evaluación odontológica.'
}

function isOnTopic(text: string) { return topicWords.test(text) }

export function PerioBotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 1, role: 'bot', text: '¡Hola! Soy PerioBot. Respondo preguntas sobre encías, periodontitis e higiene bucal. No puedo diagnosticar ni reemplazar a un odontólogo. Puedes escribir, adjuntar una imagen o audio, o usar el micrófono.' }])
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [voiceAvailable, setVoiceAvailable] = useState(false)
  const [listening, setListening] = useState(false)
  const [preferences, setPreferences] = useState<MealPreferences | null>(() => readMealPreferences())
  const [showScheduleForm, setShowScheduleForm] = useState(() => !readMealPreferences())
  const [scheduleDraft, setScheduleDraft] = useState<MealPreferences>(() => readMealPreferences() ?? defaultMealPreferences)
  const [scheduleNotice, setScheduleNotice] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const recognition = useRef<{ stop: () => void } | null>(null)
  const end = useRef<HTMLDivElement>(null)
  const objectUrls = useRef(new Set<string>())

  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), [])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages])
  useEffect(() => {
    const speechWindow = window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }
    setVoiceAvailable(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition))
  }, [])

  function addFiles(files: FileList | null) {
    if (!files) return
    const allowed = [...files].filter((file) => (file.type.startsWith('image/') || file.type.startsWith('audio/')) && file.size <= 5 * 1024 * 1024)
    const next = allowed.slice(0, Math.max(0, 3 - attachments.length)).map((file) => {
      const url = URL.createObjectURL(file)
      objectUrls.current.add(url)
      return { file, url }
    })
    setAttachments((current) => [...current, ...next])
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text && !attachments.length) return
    const files = attachments
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: text || '¿Puedes orientarme sobre este archivo?', attachments: files }
    setMessages((current) => [...current, userMessage])
    setDraft('')
    setAttachments([])
    const response = text && !isOnTopic(text)
      ? answerFor(text)
      : files.length && !text
        ? 'Gracias por compartir el archivo. Puedo recibir imágenes y audios, pero no analizarlos ni transcribirlos en esta versión. Escribe qué duda tienes sobre salud bucal. Si la imagen muestra un cambio que te preocupa, solicita una evaluación odontológica.'
        : answerFor(text)
    window.setTimeout(() => setMessages((current) => [...current, { id: Date.now() + 1, role: 'bot', text: response }]), 250)
  }

  async function saveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setScheduleNotice('')
    activateReminderSound()
    let notificationPermission: NotificationPermission | 'unsupported' = 'unsupported'
    try {
      if ('Notification' in window) {
        notificationPermission = Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission
      }
      window.localStorage.setItem(MEAL_PREFERENCES_KEY, JSON.stringify(scheduleDraft))
    } catch {
      setScheduleNotice('No se pudieron guardar los horarios o solicitar permiso. Revisa los permisos y el almacenamiento del navegador, e inténtalo de nuevo.')
      return
    }
    setPreferences(scheduleDraft)
    setShowScheduleForm(false)
    setScheduleNotice(notificationPermission === 'granted'
      ? 'Listo. El navegador podrá mostrar avisos y emitir el sonido configurado cuando llegue la hora, mientras Perioalert esté abierto.'
      : notificationPermission === 'denied'
        ? 'Guardé tus horarios, pero las notificaciones están bloqueadas. Puedes habilitarlas en la configuración del sitio; el recordatorio dentro de Perioalert y su sonido funcionarán cuando la página esté abierta.'
      : notificationPermission === 'unsupported'
        ? 'Guardé tus horarios. Este navegador no admite notificaciones; verás el aviso y oirás el sonido mientras Perioalert esté abierto.'
        : 'Guardé tus horarios. No se activaron las notificaciones; puedes permitirlas desde la configuración de este sitio. El aviso y el sonido funcionan mientras Perioalert esté abierto.')
  }

  function startVoice() {
    const speechWindow = window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Recognition) return
    const instance = new Recognition()
    instance.lang = 'es-PE'
    instance.interimResults = true
    instance.onresult = (event) => setDraft(Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(''))
    instance.onend = () => setListening(false)
    instance.onerror = () => setListening(false)
    recognition.current = instance
    setListening(true)
    instance.start()
  }

  return <div className="content-wrap inner-page periobot-page">
    <div className="page-heading"><span className="eyebrow"><span className="eyebrow-dot" />ASISTENTE EDUCATIVO</span><h1>Conoce a PerioBot.</h1><p>Respuestas claras sobre salud periodontal e higiene bucal, con orientación para saber cuándo consultar.</p></div>
    {showScheduleForm ? <section className="periobot-schedule-card"><div className="periobot-schedule-intro"><span className="chat-avatar"><Sparkles size={20} /></span><div><span className="section-kicker">UN RECORDATORIO A TU RITMO</span><h2>Primero, cuéntame de tus comidas.</h2><p>Elige a qué hora desayunas, almuerzas y cenas, y cuánto tiempo después quieres que te recuerde cepillarte.</p></div></div><form onSubmit={(event) => void saveSchedule(event)} className="periobot-schedule-form"><label>¿A qué hora desayunas?<input type="time" value={scheduleDraft.breakfast} onChange={(event) => setScheduleDraft((current) => ({ ...current, breakfast: event.target.value }))} required /></label><label>¿A qué hora almuerzas?<input type="time" value={scheduleDraft.lunch} onChange={(event) => setScheduleDraft((current) => ({ ...current, lunch: event.target.value }))} required /></label><label>¿A qué hora cenas?<input type="time" value={scheduleDraft.dinner} onChange={(event) => setScheduleDraft((current) => ({ ...current, dinner: event.target.value }))} required /></label><label>¿Cuánto tiempo después?<select value={scheduleDraft.delayMinutes} onChange={(event) => setScheduleDraft((current) => ({ ...current, delayMinutes: Number(event.target.value) }))}><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={45}>45 minutos</option><option value={60}>1 hora</option><option value={90}>1 hora y 30 minutos</option><option value={120}>2 horas</option></select></label><button className="button button-primary" type="submit">Guardar y activar recordatorios <ArrowRight size={16} /></button><p className="chat-disclaimer"><ShieldCheck size={14} /> Al guardar, el navegador te pedirá permiso para enviarte notificaciones. Mantén Perioalert abierto para que se programen los avisos.</p></form></section> : <div className="periobot-reminder-settings"><span><Sparkles size={15} />{preferences ? `Recordatorio ${preferences.delayMinutes} min después de cada comida` : ''}</span><button type="button" onClick={() => { setScheduleDraft(preferences ?? defaultMealPreferences); setShowScheduleForm(true) }}>Cambiar horarios</button></div>}
    {scheduleNotice && <p className="form-message periobot-schedule-notice" role="status">{scheduleNotice}</p>}
    {!showScheduleForm && <>
    <section className="chat-shell" aria-label="Chat con PerioBot">
      <header className="chat-heading"><span className="chat-avatar"><Sparkles size={20} /></span><div><strong>PerioBot</strong><small>Información educativa sobre encías</small></div><span className="chat-topic-badge"><ShieldCheck size={14} />Solo salud bucal</span></header>
      <div className="chat-messages" aria-live="polite">{messages.map((message) => <article className={`chat-message ${message.role}`} key={message.id}><span className="chat-message-author">{message.role === 'bot' ? 'PerioBot' : 'Tú'}</span><p>{message.text}</p>{message.attachments?.map(({ file, url }) => file.type.startsWith('image/') ? <img className="chat-image" key={url} src={url} alt={`Imagen adjunta: ${file.name}`} /> : <audio className="chat-audio" key={url} controls src={url}>{file.name}</audio>)}{message.role === 'bot' && /señales|evalua|odontólogo|cita/i.test(message.text) && <div className="chat-links"><Link to="/senales">Señales para consultar <ArrowRight size={14} /></Link><Link to="/citas">Ver citas <ArrowRight size={14} /></Link></div>}</article>)}<div ref={end} /></div>
      {attachments.length > 0 && <div className="chat-attachments" aria-label="Archivos adjuntos">{attachments.map(({ file, url }, index) => <div className="chat-attachment" key={url}>{file.type.startsWith('image/') ? <img src={url} alt="Vista previa" /> : <AudioLines size={19} />}<span title={file.name}>{file.name}</span><button type="button" aria-label={`Quitar ${file.name}`} onClick={() => { URL.revokeObjectURL(url); objectUrls.current.delete(url); setAttachments((current) => current.filter((_, i) => i !== index)) }}><X size={14} /></button></div>)}</div>}
      <form className="chat-form" onSubmit={submit}><div className="chat-tools"><button type="button" onClick={() => fileInput.current?.click()} aria-label="Adjuntar imagen o audio"><ImagePlus size={19} /><span>Imagen o audio</span></button><input ref={fileInput} type="file" accept="image/*,audio/*" multiple hidden onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = '' }} /><button type="button" disabled={!voiceAvailable} className={listening ? 'is-listening' : ''} onClick={listening ? () => recognition.current?.stop() : startVoice} aria-label={listening ? 'Detener dictado' : 'Dictar pregunta'}><Mic size={18} /><span>{listening ? 'Detener voz' : voiceAvailable ? 'Dictar' : 'Voz no disponible'}</span></button></div><div className="chat-compose"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe tu pregunta sobre encías o higiene bucal…" rows={2} maxLength={1200} aria-label="Tu pregunta" /><button className="button button-primary" type="submit" aria-label="Enviar pregunta"><Send size={17} />Enviar</button></div><p className="chat-disclaimer"><ShieldCheck size={14} /> No envíes información personal. PerioBot no analiza imágenes ni audios y no diagnostica. Ante una preocupación, consulta con un odontólogo.</p></form>
    </section>
    <div className="periobot-next"><Stethoscope size={19} /><p>¿Notas una señal que te preocupa?</p><Link to="/senales">Revisa cuándo consultar <ArrowRight size={15} /></Link></div>
    </>}
  </div>
}

interface SpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}
interface SpeechRecognitionEvent extends Event { results: ArrayLike<ArrayLike<{ transcript: string }>> }
