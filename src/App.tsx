import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Brush, CalendarDays, Check, ChevronDown,
  CircleAlert, Clock3, HeartHandshake, Menu, Pause, Play, RotateCcw, ShieldCheck,
  Sparkles, Stethoscope, X,
} from 'lucide-react'
import { AccountPage, AppointmentPage, ClinicPage, PatientPage, SignOutButton } from './Portal'
import { useAuth } from './lib/auth'

const navItems = [
  { to: '/periodontitis', label: 'Periodontitis' },
  { to: '/higiene', label: 'Higiene diaria' },
  { to: '/senales', label: 'Señales de alerta' },
  { to: '/citas', label: 'Citas' },
  { to: '/preguntas', label: 'Preguntas frecuentes' },
]

function ToothIllustration() {
  return (
    <div className="hero-art" role="img" aria-label="Ilustración decorativa de un molar">
      <div className="art-orbit" />
      <div className="art-paper">
        <span className="art-label"><Sparkles size={15} /> CUIDADO EN CADA DETALLE</span>
        <svg className="tooth-art" viewBox="0 0 520 390" aria-hidden="true">
          <defs><linearGradient id="tooth-enamel" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#eaf5fc" /></linearGradient></defs>
          <ellipse className="tooth-shadow" cx="260" cy="331" rx="99" ry="15" />
          <path className="tooth-shape" d="M260 92c-23-16-47-30-73-25-37 7-61 39-57 76 3 27 19 49 35 68 11 13 16 30 20 49l12 52c4 18 20 22 30 5l22-41c5-11 19-11 24 0l22 41c10 17 26 13 30-5l12-52c4-19 9-36 20-49 16-19 32-41 35-68 4-37-20-69-57-76-26-5-50 9-73 25Z" />
          <path className="tooth-highlight" d="M177 110c20-19 47-19 74-6 7 4 13 6 19 7-23 6-42 19-54 39-12 19-22 37-42 40-12-15-21-31-23-48-2-13 8-25 26-32Z" />
          <path className="tooth-engraving" d="M177 213c23 16 53 24 83 24s60-8 83-24" />
          <path className="tooth-glint" d="M347 108v23m-11-11h23" />
          <circle className="tooth-dot" cx="165" cy="148" r="4" />
          <circle className="tooth-dot" cx="355" cy="175" r="5" />
          <path className="art-glint" d="M117 108v27m-13-13h27" />
          <circle className="art-glint" cx="382" cy="245" r="5" />
        </svg>
        <div className="art-caption"><span /> Una sonrisa cuidada, un día a la vez</div>
      </div>
      <span className="art-orbit-dot" />
      <span className="art-sun" aria-hidden="true" />
    </div>
  )
}

function PageHeading({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div className="page-heading">
      <span className="eyebrow"><span className="eyebrow-dot" />{kicker}</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}

function SourceNote({ children = 'CDC · NIDCR' }: { children?: string }) {
  return <p className="source-note"><ShieldCheck size={15} /> Información educativa. Fuentes de referencia: {children}.</p>
}

function HomePage() {
  return (
    <>
      <section className="hero content-wrap" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" />BIENESTAR QUE EMPIEZA EN TUS ENCÍAS</span>
          <h1>Cuida tus encías,<br /><span>protege tu sonrisa.</span></h1>
          <p className="hero-lede">Información sencilla para entender tu salud periodontal, cuidar tus hábitos y saber cuándo consultar.</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/higiene">Explora tu rutina <ArrowRight size={17} /></Link>
            <Link className="text-link" to="/periodontitis">Conoce la periodontitis <ArrowDownRight size={16} /></Link>
          </div>
          <div className="hero-note"><ShieldCheck size={17} /><span>Aprende a tu ritmo, con información clara</span></div>
        </div>
        <ToothIllustration />
        <div className="hero-index"><span>01</span><span className="index-rule" />Una guía para tus encías</div>
      </section>

      <section className="welcome-band">
        <div className="content-wrap welcome-grid">
          <div className="welcome-mark"><HeartHandshake size={27} /><span>Tu bienestar,<br />primero.</span></div>
          <div className="welcome-copy"><span className="section-kicker">ENTENDER ES PREVENIR</span><h2>La salud de tus encías<br />también es parte de tu salud.</h2></div>
          <p>La enfermedad periodontal puede avanzar con pocas molestias. Aprender a reconocer cambios y hablar con un profesional son buenos primeros pasos.</p>
        </div>
      </section>

      <section className="explore-section content-wrap">
        <div className="section-title-row"><div><span className="section-kicker">UNA GUÍA PARA EMPEZAR</span><h2>Encuentra lo que<br />necesitas saber.</h2></div><p>Avanza por los temas a tu ritmo. Cada página está pensada para resolver una pregunta concreta.</p></div>
        <div className="explore-grid">
          <Link className="topic-card topic-featured" to="/periodontitis"><span className="topic-icon"><BookOpen size={21} /></span><span className="topic-number">01 / ENTENDER</span><h3>¿Qué es la<br />periodontitis?</h3><p>Conoce cómo afecta los tejidos que sostienen tus dientes.</p><span className="topic-link">Leer la guía <ArrowUpRight size={16} /></span><span className="topic-deco deco-rings" /></Link>
          <Link className="topic-card topic-hygiene" to="/higiene"><span className="topic-icon"><Brush size={21} /></span><span className="topic-number">02 / CUIDAR</span><h3>Tu higiene<br />de cada día</h3><p>Ideas para acompañar una rutina sencilla y constante.</p><span className="topic-link">Ver hábitos <ArrowUpRight size={16} /></span><span className="topic-deco deco-sun" /></Link>
          <Link className="topic-card topic-alert" to="/senales"><span className="topic-icon"><CircleAlert size={21} /></span><span className="topic-number">03 / OBSERVAR</span><h3>Señales que<br />conviene consultar</h3><p>Identifica cambios que puedes conversar con tu odontólogo.</p><span className="topic-link">Ver señales <ArrowUpRight size={16} /></span><span className="topic-deco deco-wave" /></Link>
        </div>
      </section>

      <section className="member-section content-wrap">
        <div className="member-intro"><span className="section-kicker">UN ESPACIO PARA TI</span><h2>Tu cuidado,<br />también en tu día a día.</h2><p>Organiza tus hábitos, guarda horarios que quieras recordar y envía a la clínica una preferencia de fecha.</p><Link className="button button-primary" to="/mi-salud">Entrar a mi espacio <ArrowRight size={17} /></Link><span className="member-footnote"><ShieldCheck size={15} /> Los datos del portal requieren una cuenta segura.</span></div>
        <div className="member-tools">
          <Link to="/mi-salud" className="member-tool"><span className="member-tool-icon tool-blue"><Check size={20} /></span><span><b>Seguimiento personal</b><small>Marca tus hábitos a tu ritmo.</small></span><ArrowUpRight size={17} /></Link>
          <Link to="/mi-salud" className="member-tool"><span className="member-tool-icon tool-cyan"><Clock3 size={20} /></span><span><b>Recordatorios guardados</b><small>Los horarios se guardan; aún no envían avisos.</small></span><ArrowUpRight size={17} /></Link>
          <Link to="/citas" className="member-tool"><span className="member-tool-icon tool-sky"><CalendarDays size={20} /></span><span><b>Preferencia de cita</b><small>La clínica revisa y confirma la fecha.</small></span><ArrowUpRight size={17} /></Link>
        </div>
      </section>

      <section className="home-cta"><div className="content-wrap home-cta-inner"><div><span className="section-kicker">UN PROFESIONAL PUEDE ORIENTARTE</span><h2>Tu cuidado también<br />se conversa.</h2></div><div><p>La información ayuda, pero una evaluación dental es la forma de conocer las necesidades de tu salud bucal.</p><Link className="button button-light" to="/contacto">Información de contacto <ArrowRight size={17} /></Link></div></div></section>
    </>
  )
}

function PeriodontitisPage() {
  return (
    <div className="content-wrap inner-page">
      <PageHeading kicker="ENTENDER ES PREVENIR" title="¿Qué es la periodontitis?" subtitle="Una condición que afecta los tejidos que rodean y sostienen los dientes. Conocerla ayuda a saber cuándo pedir una evaluación profesional." />
      <div className="editorial-grid">
        <aside className="page-aside"><span className="aside-number">01</span><span className="aside-line" /><span>Lo esencial</span></aside>
        <article className="article-content">
          <h2>Empieza en los tejidos que sostienen cada diente.</h2>
          <p>Las enfermedades periodontales afectan las encías y otros tejidos de soporte. La gingivitis es una forma inicial de inflamación; si no se trata, puede progresar a periodontitis, que también puede afectar el hueso alrededor de los dientes.</p>
          <p>La placa bacteriana que se acumula junto a la línea de la encía puede contribuir a la inflamación. La evaluación y el cuidado profesional ayudan a identificar qué ocurre y qué atención necesitas.</p>
          <div className="callout"><ShieldCheck size={20} /><p>La periodontitis no se confirma con una página web. Un odontólogo examina las encías y los dientes para hacer una evaluación.</p></div>
        </article>
      </div>
      <section className="progress-section"><div className="section-title-row compact"><div><span className="section-kicker">CAMBIOS QUE PUEDE EVALUAR UN PROFESIONAL</span><h2>De la inflamación<br />al cuidado oportuno.</h2></div><p>Las etapas no se determinan por una lista de síntomas. La revisión clínica es necesaria.</p></div><div className="progress-steps"><article><span>01</span><h3>Encías inflamadas</h3><p>Pueden verse enrojecidas, sensibles o sangrar con facilidad.</p></article><article><span>02</span><h3>Tejido de soporte</h3><p>La periodontitis puede afectar tejidos y hueso que sostienen los dientes.</p></article><article><span>03</span><h3>Evaluación y cuidado</h3><p>El profesional determina el estado de salud y las opciones de tratamiento.</p></article></div></section>
      <div className="page-next"><SourceNote /><Link className="button button-primary" to="/senales">Revisar señales <ArrowRight size={17} /></Link></div>
    </div>
  )
}

function BrushTimer() {
  const [seconds, setSeconds] = useState(120)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running || seconds === 0) return
    const timer = window.setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [running, seconds])
  useEffect(() => { if (seconds === 0) setRunning(false) }, [seconds])
  const formatted = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  return (
    <div className="timer-panel">
      <div><span className="section-kicker">UN MOMENTO PARA TI</span><h2>Dos minutos,<br />con calma.</h2><p>Usa este temporizador mientras te cepillas. Sigue siempre las indicaciones de tu profesional dental.</p></div>
      <div className="timer-display"><div className="timer-ring"><Clock3 size={20} /><span>{formatted}</span></div><div className="timer-controls"><button className="timer-button" type="button" onClick={() => setRunning(!running)} aria-label={running ? 'Pausar temporizador' : 'Iniciar temporizador'}>{running ? <Pause size={17} /> : <Play size={17} />}{running ? 'Pausar' : seconds === 0 ? 'Iniciar otra vez' : 'Iniciar'}</button><button className="timer-reset" type="button" onClick={() => { setRunning(false); setSeconds(120) }} aria-label="Reiniciar temporizador"><RotateCcw size={17} /><span>Reiniciar</span></button></div>{seconds === 0 && <p className="timer-done" role="status"><Check size={16} />Tiempo completado</p>}</div>
    </div>
  )
}

function HygienePage() {
  return (
    <div className="content-wrap inner-page">
      <PageHeading kicker="TU RUTINA, A TU RITMO" title="Hábitos sencillos para cada día." subtitle="Una rutina constante puede ayudarte a cuidar dientes y encías. Tu odontólogo puede adaptar las recomendaciones a tus necesidades." />
      <BrushTimer />
      <section className="routine-section"><div className="section-title-row compact"><div><span className="section-kicker">UNA RUTINA POSIBLE</span><h2>Cuatro gestos<br />para cuidar tu boca.</h2></div><p>Elige las herramientas que se adapten a ti y consulta si necesitas ayuda para usarlas.</p></div><div className="routine-list">
        <article><span className="routine-no">01</span><div><h3>Cepilla con suavidad</h3><p>La recomendación general es cepillarse dos veces al día durante dos minutos con pasta dental con flúor y un cepillo de cerdas suaves.</p></div><Brush size={20} /></article>
        <article><span className="routine-no">02</span><div><h3>Limpia entre los dientes</h3><p>El hilo dental u otro limpiador interdental puede ayudar a limpiar donde el cepillo no llega. Elige el que te recomiende un profesional.</p></div><Sparkles size={20} /></article>
        <article><span className="routine-no">03</span><div><h3>Completa tu rutina</h3><p>Recorre con cuidado todas las superficies de los dientes y sigue las indicaciones de uso de tus productos dentales.</p></div><Check size={20} /></article>
        <article><span className="routine-no">04</span><div><h3>Pregunta si algo no te resulta cómodo</h3><p>Un odontólogo o higienista dental puede mostrarte cómo usar el cepillo y los limpiadores interdentales.</p></div><HeartHandshake size={20} /></article>
      </div></section>
      <div className="page-next"><SourceNote>ADA · NIDCR</SourceNote><Link className="button button-primary" to="/preguntas">¿Tienes dudas? <ArrowRight size={17} /></Link></div>
    </div>
  )
}

function SignalsPage() {
  const signals = [
    ['Sangrado', 'Sangrado al cepillarte o limpiar entre los dientes.'],
    ['Enrojecimiento o inflamación', 'Encías sensibles, inflamadas o que parecen haberse retraído.'],
    ['Sensibilidad o movilidad', 'Dientes sensibles, flojos o cambios al morder.'],
    ['Cambios persistentes', 'Cualquier cambio en tus encías o dientes que te preocupe.'],
  ]
  return (
    <div className="content-wrap inner-page">
      <PageHeading kicker="OBSERVA SIN AUTODIAGNOSTICARTE" title="Señales que conviene consultar." subtitle="Algunos cambios en las encías y los dientes pueden ser motivo para pedir una revisión. Esta lista orienta, pero no confirma una enfermedad." />
      <div className="signals-layout"><div className="signals-list">{signals.map(([title, body], i) => <article className="signal-row" key={title}><span className="signal-no">0{i + 1}</span><div><h2>{title}</h2><p>{body}</p></div><ArrowUpRight size={18} /></article>)}</div><aside className="consult-card"><span className="consult-icon"><Stethoscope size={22} /></span><span className="section-kicker">CUÁNDO PEDIR ORIENTACIÓN</span><h2>Si algo te preocupa, consulta.</h2><p>Un odontólogo puede revisar tus encías, valorar tus síntomas y explicarte los siguientes pasos.</p><Link className="button button-light" to="/contacto">Ver contacto <ArrowRight size={16} /></Link><div className="consult-note">La apariencia de las encías por sí sola no basta para hacer un diagnóstico.</div></aside></div>
      <div className="page-next"><SourceNote /><Link className="button button-primary" to="/periodontitis">Entender la periodontitis <ArrowRight size={17} /></Link></div>
    </div>
  )
}

const faqItems = [
  ['¿La enfermedad de las encías siempre causa dolor?', 'No siempre. Algunas enfermedades de las encías pueden ser poco notorias al principio. Si observas cambios, pide una evaluación profesional.'],
  ['¿Con qué frecuencia debo visitar al odontólogo?', 'La frecuencia depende de tu salud bucal y de tus necesidades. Tu odontólogo puede recomendarte un calendario adecuado para ti.'],
  ['¿Qué cepillo es mejor para mí?', 'Un cepillo de cerdas suaves es una recomendación general. El tamaño y tipo que te resulte más cómodo puede depender de tus necesidades; consúltalo en tu próxima visita.'],
  ['¿Puedo saber por esta web si tengo periodontitis?', 'No. La información de esta página es educativa y no sustituye un examen, diagnóstico o consejo de un profesional de salud.'],
]

function QuestionsPage() {
  return (
    <div className="content-wrap inner-page">
      <PageHeading kicker="RESPUESTAS CLARAS" title="Preguntas frecuentes." subtitle="Respuestas breves para orientarte. Si tu pregunta es sobre tu salud, consulta a un profesional que conozca tu caso." />
      <div className="faq-page-layout"><div className="faq-page-intro"><span className="faq-big-icon"><BookOpen size={25} /></span><h2>¿No encuentras tu respuesta?</h2><p>Tu odontólogo puede orientarte con información personalizada para tu salud bucal.</p><Link className="text-link" to="/contacto">Información de contacto <ArrowRight size={16} /></Link></div><div className="faq-list">{faqItems.map(([q, a]) => <details key={q}><summary>{q}<ChevronDown size={18} /></summary><p>{a}</p></details>)}</div></div>
      <div className="page-next"><SourceNote /><Link className="button button-primary" to="/higiene">Ver hábitos de higiene <ArrowRight size={17} /></Link></div>
    </div>
  )
}

function ContactPage() {
  return (
    <div className="content-wrap inner-page contact-page">
      <PageHeading kicker="ACOMPAÑAMIENTO PROFESIONAL" title="Tu salud bucal merece atención." subtitle="La orientación de un profesional ayuda a responder las preguntas sobre tu caso y definir los siguientes pasos." />
      <div className="contact-panel"><div className="contact-illustration"><span className="contact-blob"><HeartHandshake size={54} /></span><span className="contact-caption">CUIDADO CON CALMA</span></div><div className="contact-panel-copy"><span className="section-kicker">PRÓXIMAMENTE</span><h2>Estamos preparando las citas en línea.</h2><p>Esta versión todavía no tiene teléfono, correo ni dirección de una clínica asociados. Para solicitar una consulta, comunícate directamente con tu odontólogo habitual.</p><p className="contact-setup-note"><ShieldCheck size={17} /> Cuando tengamos los datos oficiales de la clínica, podremos publicar sus canales de contacto y configurar solicitudes de cita.</p><Link className="text-link" to="/">Volver al inicio <ArrowRight size={16} /></Link></div></div>
    </div>
  )
}

function NotFoundPage() {
  return <div className="content-wrap not-found"><span className="section-kicker">PÁGINA NO ENCONTRADA</span><h1>Este camino no aparece en el mapa.</h1><p>Prueba con una de las guías disponibles.</p><Link className="button button-primary" to="/">Ir al inicio <ArrowRight size={17} /></Link></div>
}

function PrivacyPage() {
  return <div className="content-wrap inner-page privacy-page">
    <PageHeading kicker="INFORMACIÓN SOBRE TUS DATOS" title="Aviso de privacidad" subtitle="Borrador informativo del flujo de citas de Perioalert." />
    <section className="privacy-notice-card">
      <div className="privacy-demo-warning"><ShieldCheck size={18} /><p><strong>Este aviso está en modo demostración.</strong> Antes de recibir pacientes, la clínica debe completar su identidad legal, datos de contacto, finalidad, plazo de conservación y canal para ejercer derechos.</p></div>
      <h2>Qué datos se usan para solicitar una cita</h2>
      <p>Si inicias sesión y envías una solicitud, se guardan tu nombre completo, edad y, si decides proporcionarlo, tu DNI de ocho dígitos. También se guarda el correo que indiques para recibir la confirmación, junto con la fecha y hora elegidas, motivo general, descripción opcional y las fotos que adjuntes.</p>
      <h2>Para qué se usan</h2>
      <p>La clínica puede revisar la solicitud, identificar al paciente y responder si el horario está disponible. El correo indicado se usa para enviar la confirmación de recepción. El DNI es opcional mientras la clínica confirma si lo necesita. Las fotos, la descripción y el DNI no se incluyen en el correo.</p>
      <h2>Dónde se guardan y quién puede verlos</h2>
      <p>Los datos de la cuenta, los datos identificativos, el correo de contacto y la cita se guardan en Supabase. Las fotos se guardan en un bucket privado. Solo el paciente y los perfiles autorizados de la clínica pueden consultar estos datos. El correo de recepción contiene únicamente la fecha y hora.</p>
      <h2>Qué no debes adjuntar</h2>
      <p>No adjuntes imágenes de documentos de identidad, información financiera ni fotos de otras personas. El campo DNI del formulario es opcional y la clínica debe validar si lo necesita antes de aceptar datos reales. Adjunta solo fotos relacionadas con tu consulta.</p>
      <p className="card-footnote">Este borrador no reemplaza el aviso aprobado de la clínica. Antes del lanzamiento real, debe completar identidad legal, finalidad, necesidad de cada dato, conservación, responsable y canal para ejercer derechos.</p>
    </section>
  </div>
}

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { configured, user } = useAuth()
  useEffect(() => {
    setMenuOpen(false)
    const titles: Record<string, string> = {
      '/': 'Perioalert · Cuida tus encías',
      '/periodontitis': 'Periodontitis · Perioalert',
      '/higiene': 'Higiene diaria · Perioalert',
      '/senales': 'Señales de alerta · Perioalert',
      '/preguntas': 'Preguntas frecuentes · Perioalert',
      '/contacto': 'Contacto · Perioalert',
      '/privacidad': 'Aviso de privacidad · Perioalert',
      '/cuenta': 'Mi espacio · Perioalert',
      '/mi-salud': 'Mi salud · Perioalert',
      '/citas': 'Solicitar cita · Perioalert',
      '/clinica': 'Panel de clínica · Perioalert',
    }
    document.title = titles[location.pathname] ?? 'Página no encontrada · Perioalert'
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return

    const content = document.getElementById('contenido')
    if (!content) return
    const revealSelector = [
      '.hero-copy', '.hero-art', '.welcome-grid > *', '.section-title-row', '.topic-card',
      '.member-intro', '.member-tool', '.home-cta-inner > div', '.page-heading', '.editorial-grid',
      '.article-content', '.callout', '.progress-section', '.timer-panel', '.routine-list > article',
      '.signals-list > *', '.consult-card', '.faq-page-layout > *', '.contact-panel', '.privacy-notice-card',
      '.demo-banner', '.appointment-access-card', '.account-story', '.account-card', '.dashboard-heading', '.today-card', '.week-card',
      '.dashboard-side > *', '.booking-intro', '.clinic-profile-card', '.booking-card', '.clinic-stats > *',
      '.clinic-table-card', '.access-denied', '.not-found',
    ].join(',')
    const targets = new Set<HTMLElement>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting)
      })
    }, { threshold: 0.01, rootMargin: '-8% 0px -8% 0px' })

    const observeTarget = (target: HTMLElement) => {
      if (targets.has(target)) return
      const index = targets.size
      targets.add(target)
      target.classList.add('scroll-reveal')
      target.style.setProperty('--scroll-reveal-delay', `${(index % 4) * 65}ms`)
      observer.observe(target)
    }
    const collectTargets = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(revealSelector)) observeTarget(root)
      root.querySelectorAll<HTMLElement>(revealSelector).forEach(observeTarget)
    }

    collectTargets(content)
    document.querySelectorAll<HTMLElement>('.site-footer .footer-main > *, .site-footer .footer-bottom > *').forEach(observeTarget)
    const contentObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) collectTargets(node)
      }))
    })
    contentObserver.observe(content, { childList: true, subtree: true })

    return () => {
      contentObserver.disconnect()
      observer.disconnect()
      targets.forEach((target) => {
        target.classList.remove('scroll-reveal', 'is-visible')
        target.style.removeProperty('--scroll-reveal-delay')
      })
    }
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#contenido">Ir al contenido</a>
      <header className="site-header">
        <div className="nav-wrap">
          <Link className="brand" to="/" aria-label="Perioalert, inicio"><span className="brand-icon"><span className="brand-smile" /></span><span>perio<span className="brand-light">alert</span></span></Link>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}><span className="sr-only">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          <nav id="site-nav" className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Navegación principal">
            {navItems.map(({ to, label }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}
            <NavLink className="nav-cta" to={configured && user ? '/mi-salud' : '/cuenta'} onClick={() => setMenuOpen(false)}>{configured && user ? 'Mi espacio' : 'Acceso'} <ArrowUpRight size={15} /></NavLink>
          </nav>
        </div>
      </header>
      <main id="contenido" key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/periodontitis" element={<PeriodontitisPage />} />
          <Route path="/higiene" element={<HygienePage />} />
          <Route path="/senales" element={<SignalsPage />} />
          <Route path="/preguntas" element={<QuestionsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/cuenta" element={<AccountPage />} />
          <Route path="/mi-salud" element={<PatientPage />} />
          <Route path="/citas" element={<AppointmentPage />} />
          <Route path="/clinica" element={<ClinicPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="site-footer"><div className="content-wrap footer-main"><div><Link className="brand footer-brand" to="/"><span className="brand-icon"><span className="brand-smile" /></span><span>perio<span className="brand-light">alert</span></span></Link><p>Información para cuidar tus encías<br />y acompañar tu bienestar.</p><SignOutButton /></div><div className="footer-links"><span className="footer-label">EXPLORA</span>{navItems.slice(0, 3).map(({ to, label }) => <Link key={to} to={to}>{label}</Link>)}<Link to="/mi-salud">Mi espacio</Link><Link to="/clinica">Acceso de clínica</Link><Link to="/contacto">Contacto</Link><Link to="/privacidad">Privacidad</Link></div><Link to="/" className="back-top">Volver al inicio <ArrowUpRight size={15} /></Link></div><div className="content-wrap footer-bottom"><span>© {new Date().getFullYear()} Perioalert</span><span className="medical-notice">Contenido educativo. No sustituye la evaluación de un profesional de salud. Fuentes: <a href="https://www.cdc.gov/oral-health/about/gum-periodontal-disease.html" target="_blank" rel="noreferrer">CDC</a> · <a href="https://www.nidcr.nih.gov/health-info/gum-disease" target="_blank" rel="noreferrer">NIDCR</a> · <a href="https://www.ada.org/resources/ada-library/oral-health-topics/home-oral-care/" target="_blank" rel="noreferrer">ADA</a>.</span></div></footer>
    </>
  )
}

export default function App() {
  return <SiteLayout />
}
