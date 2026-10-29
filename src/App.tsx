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

function HeroPhoto() {
  return (
    <figure className="hero-photo">
      <img src="/images/hero-brushing.jpg" alt="Una mujer se cepilla los dientes frente al espejo durante su rutina diaria" fetchPriority="high" />
      <figcaption><Sparkles size={14} /> Cuidado en cada detalle</figcaption>
    </figure>
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
        <HeroPhoto />
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
          <Link className="topic-card topic-featured" to="/periodontitis"><figure className="topic-image-frame"><img className="topic-image" src="/images/dental-consultation.jpg" alt="" loading="lazy" /><figcaption className="topic-image-caption">Consulta profesional</figcaption></figure><div className="topic-card-content"><div className="topic-card-meta"><span className="topic-icon"><BookOpen size={21} /></span><span className="topic-number">01 / ENTENDER</span></div><h3>¿Qué es la<br />periodontitis?</h3><p>Conoce cómo afecta los tejidos que sostienen tus dientes.</p><span className="topic-link">Leer la guía <ArrowUpRight size={16} /></span></div></Link>
          <Link className="topic-card topic-hygiene" to="/higiene"><figure className="topic-image-frame"><img className="topic-image" src="/images/brushing-model-instruction.jpg" alt="" loading="lazy" /><figcaption className="topic-image-caption">Demostración en modelo dental</figcaption></figure><div className="topic-card-content"><div className="topic-card-meta"><span className="topic-icon"><Brush size={21} /></span><span className="topic-number">02 / CUIDAR</span></div><h3>Tu higiene<br />de cada día</h3><p>Ideas para acompañar una rutina sencilla y constante.</p><span className="topic-link">Ver hábitos <ArrowUpRight size={16} /></span></div></Link>
          <Link className="topic-card topic-alert" to="/senales"><figure className="topic-image-frame"><img className="topic-image" src="/images/gingivitis-clinical.jpg" alt="" loading="lazy" /><figcaption className="topic-image-caption">Ejemplo clínico · Gingivitis</figcaption></figure><div className="topic-card-content"><div className="topic-card-meta"><span className="topic-icon"><CircleAlert size={21} /></span><span className="topic-number">03 / OBSERVAR</span></div><h3>Señales que<br />conviene consultar</h3><p>Identifica cambios que puedes conversar con tu odontólogo.</p><span className="topic-link">Ver señales <ArrowUpRight size={16} /></span></div></Link>
        </div>
      </section>

      <section className="home-photo-stories content-wrap" aria-labelledby="home-photo-stories-title">
        <div className="section-title-row compact"><div><span className="section-kicker">CUIDADO EN CASA Y EN CONSULTA</span><h2 id="home-photo-stories-title">Pequeños pasos,<br />buenas conversaciones.</h2></div><p>Encuentra ideas para tu rutina y orientación para conversar los cambios que notes.</p></div>
        <div className="home-photo-grid">
          <article className="home-photo-card"><img src="/images/interdental-flossing.jpg" alt="Mujer usa un limpiador interdental frente al espejo" loading="lazy" /><div><span className="section-kicker">HIGIENE DIARIA</span><h3>Cuida también los espacios entre los dientes.</h3><Link to="/higiene">Explorar la guía visual <ArrowRight size={15} /></Link></div></article>
          <article className="home-photo-card"><img src="/images/periodontal-evaluation.jpg" alt="Odontólogo explica una radiografía dental a una paciente durante una consulta" loading="lazy" /><div><span className="section-kicker">ORIENTACIÓN PROFESIONAL</span><h3>Conversa sobre los cambios que observes.</h3><Link to="/senales">Revisar señales de alerta <ArrowRight size={15} /></Link></div></article>
        </div>
      </section>

      <section className="member-section content-wrap">
        <div className="member-intro"><span className="section-kicker">UN ESPACIO PARA TI</span><h2>Tu cuidado,<br />también en tu día a día.</h2><p>Organiza tus hábitos, guarda horarios que quieras recordar y envía a la clínica una preferencia de fecha.</p><Link className="button button-primary" to="/mi-salud">Entrar a mi espacio <ArrowRight size={17} /></Link><span className="member-footnote"><ShieldCheck size={15} /> Los datos del portal requieren una cuenta segura.</span></div>
        <div className="member-tools">
          <Link to="/mi-salud" className="member-tool"><span className="member-tool-icon tool-blue"><Check size={20} /></span><span><b>Seguimiento personal</b><small>Marca tus hábitos a tu ritmo.</small></span><ArrowUpRight size={17} /></Link>
          <Link to="/mi-salud" className="member-tool"><span className="member-tool-icon tool-cyan"><Clock3 size={20} /></span><span><b>Recordatorios guardados</b><small>Los horarios se guardan; aún no envían avisos.</small></span><ArrowUpRight size={17} /></Link>
          <Link to="/citas" className="member-tool"><span className="member-tool-icon tool-sky"><CalendarDays size={20} /></span><span><b>Reserva de horario</b><small>Se confirma al completar la cita.</small></span><ArrowUpRight size={17} /></Link>
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
      <section className="periodontal-photo-section" aria-label="Fotografías clínicas de gingivitis y periodontitis">
        <div className="section-title-row compact"><div><span className="section-kicker">EJEMPLOS CLÍNICOS REALES</span><h2>Así pueden verse<br />algunos cambios.</h2></div><p>Las fotos muestran signos visibles de gingivitis y un caso leve de periodontitis. La presentación varía entre personas y una imagen no basta para hacer un diagnóstico.</p></div>
        <div className="periodontal-photo-grid">
          <figure className="periodontal-photo-card"><img src="/images/gingivitis-clinical.jpg" alt="Fotografía clínica de gingivitis con encía inflamada y cálculo visible junto al borde dental" loading="lazy" /><figcaption><strong>Gingivitis</strong><span>Enrojecimiento e inflamación en el borde de la encía.</span></figcaption></figure>
          <figure className="periodontal-photo-card"><img src="/images/periodontitis-clinical-mild.jpg" alt="Fotografía clínica de periodontitis leve con recesión de la encía alrededor de los dientes" loading="lazy" /><figcaption><strong>Periodontitis leve</strong><span>Puede observarse recesión gingival; el diagnóstico requiere examen profesional.</span></figcaption></figure>
        </div>
        <p className="clinical-image-note"><ShieldCheck size={15} /> Ejemplos educativos; no sustituyen una revisión. Créditos: <a href="https://commons.wikimedia.org/wiki/File:Gingivitis.jpg" target="_blank" rel="noreferrer">Gingivitis, Roquex</a> (<a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0 1.0</a>) · <a href="https://commons.wikimedia.org/wiki/File:Mirna_parodontitida.jpg" target="_blank" rel="noreferrer">Periodontitis leve, D-institut</a> (<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>).</p>
      </section>
      <aside className="periodontal-evaluation-photo"><figure><img src="/images/periodontal-evaluation.jpg" alt="Odontólogo explica una radiografía dental a una paciente" loading="lazy" /><figcaption>Fotografía referencial de una consulta</figcaption></figure><div><span className="section-kicker">LA EVALUACIÓN ES PERSONAL</span><h2>Una imagen orienta, el profesional evalúa.</h2><p>Las fotos de esta guía son ejemplos educativos. Un odontólogo examina las encías y los dientes para valorar cada caso.</p><Link className="text-link" to="/senales">Ver cuándo consultar <ArrowRight size={16} /></Link></div></aside>
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
  const brushingStages = [
    { image: 'brushing-model-closeup.jpg', alt: 'Primer plano de un cepillo colocado junto a los dientes de un modelo dental', title: 'Ubica las cerdas junto a la encía', body: 'Inclina el cepillo unos 45° hacia el borde de la encía. Apóyalo con suavidad y evita aplastar las cerdas.', tag: 'Posición' },
    { image: 'brushing-model-instruction.jpg', alt: 'Profesional dental demuestra cómo recorrer los dientes con un cepillo en un modelo', title: 'Recorre las caras externas', body: 'Avanza por grupos pequeños con movimientos cortos y suaves, desde un extremo de la boca hasta el otro.', tag: 'Exterior' },
    { image: 'brushing-model-hands.jpg', alt: 'Demostración cercana del cepillado en la cara interna de un modelo dental', title: 'Limpia las caras internas', body: 'Detrás de los dientes frontales, sostén el cepillo en vertical y realiza varios movimientos cortos.', tag: 'Interior' },
    { image: 'brushing-model-surface.jpg', alt: 'Cepillo limpiando las superficies de un modelo dental durante una demostración', title: 'Completa las muelas', body: 'Cepilla las superficies con las que masticas y las zonas posteriores. Reparte el tiempo hasta completar dos minutos.', tag: 'Muelas' },
  ]
  return (
    <div className="content-wrap inner-page">
      <PageHeading kicker="TU RUTINA, A TU RITMO" title="Hábitos sencillos para cada día." subtitle="Una rutina constante puede ayudarte a cuidar dientes y encías. Tu odontólogo puede adaptar las recomendaciones a tus necesidades." />
      <BrushTimer />
      <section className="brushing-guide" aria-labelledby="brushing-guide-title">
        <div className="section-title-row compact"><div><span className="section-kicker">PASO A PASO, SIN APURARTE</span><h2 id="brushing-guide-title">Un recorrido completo<br />por toda tu sonrisa.</h2></div><p>Como guía general, usa un cepillo de cerdas suaves y pasta con flúor durante dos minutos, dos veces al día. Las fotos muestran demostraciones en modelos dentales.</p></div>
        <div className="brushing-stage-grid">{brushingStages.map((stage, index) => <article className="brushing-stage-card" key={stage.image}><div className="brushing-stage-figure"><img src={`/images/${stage.image}`} alt={stage.alt} loading="lazy" /><span className="brushing-stage-count">0{index + 1}</span></div><div className="brushing-stage-copy"><span className="brushing-stage-tag">{stage.tag}</span><h3>{stage.title}</h3><p>{stage.body}</p></div></article>)}</div>
        <p className="brushing-personal-note"><ShieldCheck size={16} /> Técnica general basada en la <a href="https://www.mouthhealthy.org/all-topics-a-z/brushing-your-teeth/" target="_blank" rel="noreferrer">guía de cepillado de la ADA</a>. Puede variar según tu boca, destreza o tratamiento; pide a tu odontólogo que te enseñe cómo adaptarla.</p>
      </section>
      <section className="routine-section"><div className="section-title-row compact"><div><span className="section-kicker">UNA RUTINA POSIBLE</span><h2>Cuatro gestos<br />para cuidar tu boca.</h2></div><p>Elige las herramientas que se adapten a ti y consulta si necesitas ayuda para usarlas.</p></div><div className="routine-list">
        <article><span className="routine-no">01</span><div><h3>Cepilla con suavidad</h3><p>La recomendación general es cepillarse dos veces al día durante dos minutos con pasta dental con flúor y un cepillo de cerdas suaves.</p></div><Brush size={20} /></article>
        <article><span className="routine-no">02</span><div><h3>Limpia entre los dientes</h3><p>El hilo dental u otro limpiador interdental puede ayudar a limpiar donde el cepillo no llega. Elige el que te recomiende un profesional.</p></div><Sparkles size={20} /></article>
        <article><span className="routine-no">03</span><div><h3>Completa tu rutina</h3><p>Recorre con cuidado todas las superficies de los dientes y sigue las indicaciones de uso de tus productos dentales.</p></div><Check size={20} /></article>
        <article><span className="routine-no">04</span><div><h3>Pregunta si algo no te resulta cómodo</h3><p>Un odontólogo o higienista dental puede mostrarte cómo usar el cepillo y los limpiadores interdentales.</p></div><HeartHandshake size={20} /></article>
      </div></section>
      <section className="interdental-photo-card" aria-labelledby="interdental-photo-title"><figure><img src="/images/interdental-flossing.jpg" alt="Mujer usa un limpiador interdental frente al espejo" loading="lazy" /><figcaption>Un limpiador interdental en la rutina de casa</figcaption></figure><div><span className="section-kicker">LIMPIEZA INTERDENTAL</span><h2 id="interdental-photo-title">El cepillo no es el único paso.</h2><p>El hilo u otro limpiador interdental puede complementar tu rutina. En la consulta pueden mostrarte cómo usarlo y cuál se adapta mejor a ti.</p><Link className="text-link" to="/preguntas">Leer respuestas frecuentes <ArrowRight size={16} /></Link></div></section>
      <section className="hygiene-video-card" aria-labelledby="hygiene-video-title">
        <div className="hygiene-video-copy"><span className="section-kicker">APRENDE VIÉNDOLO</span><h2 id="hygiene-video-title">Mira la técnica<br />en movimiento.</h2><p>Este video del Consejo General de Dentistas de España explica el uso del cepillo manual. Sigue las indicaciones personalizadas que te haya dado tu profesional.</p><a className="hygiene-video-source" href="https://consejodentistas.es/informacion-publica/salud-bucodental/campanas/taller-de-higiene-bucodental/videos-educativos/" target="_blank" rel="noreferrer">Consejo General de Dentistas <ArrowUpRight size={15} /></a></div>
        <div className="hygiene-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/jLFUD74h4Bo?rel=0" title="Video educativo en español: técnica de cepillado manual" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><span className="video-caption"><Play size={13} /> Técnica de cepillado manual</span></div>
      </section>
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
      <aside className="signals-evaluation-photo"><figure><img src="/images/dental-examination.jpg" alt="Odontóloga revisa los dientes de una paciente durante una evaluación" loading="lazy" /><figcaption>Revisión dental profesional</figcaption></figure><div><span className="section-kicker">UNA REVISIÓN ACLARA LOS SIGUIENTES PASOS</span><h2>Observa los cambios y coméntalos en consulta.</h2><p>La fotografía no permite confirmar la causa. El profesional puede revisar lo que notas y orientarte según tu situación.</p><Link className="text-link" to="/citas">Ver horarios de consulta <ArrowRight size={16} /></Link></div></aside>
      <section className="condition-explorer" aria-labelledby="condition-explorer-title">
        <div className="section-title-row compact"><div><span className="section-kicker">GUÍA VISUAL EDUCATIVA</span><h2 id="condition-explorer-title">Cambios que puede<br />valorar un profesional.</h2></div><p>Las fotos muestran ejemplos clínicos seleccionados. Los signos pueden tener distintas causas y no permiten confirmar un diagnóstico por sí solos.</p></div>
        <div className="condition-grid">
          <article className="condition-card"><div className="condition-card-figure"><img className="condition-photo" src="/images/gingivitis-clinical.jpg" alt="Fotografía clínica de gingivitis con inflamación del margen gingival y cálculo" loading="lazy" /><span className="condition-figure-caption">Ejemplo clínico · Gingivitis</span></div><div className="condition-card-content"><span className="condition-kicker">INFLAMACIÓN DE LA ENCÍA</span><h3>Gingivitis</h3><p>Puede verse enrojecida, hinchada o sangrar con facilidad. Una evaluación dental puede ayudar a identificar la causa.</p><details className="condition-more"><summary>Saber más <ChevronDown size={16} /></summary><div><p>La gingivitis es una inflamación de la encía y suele ser reversible con cuidado adecuado y atención profesional. No todas las molestias o sangrados tienen la misma causa.</p><a href="https://www.cdc.gov/oral-health/about/gum-periodontal-disease.html" target="_blank" rel="noreferrer">Leer información de CDC <ArrowUpRight size={14} /></a></div></details><Link className="condition-cta" to="/citas" state={{ appointmentPrefill: { reason: 'bleeding', patientNote: 'He notado enrojecimiento o sangrado de encías y quisiera conversarlo en la cita.' } }}>Quiero conversar estos cambios <ArrowRight size={16} /></Link></div></article>
          <article className="condition-card"><div className="condition-card-figure"><img className="condition-photo" src="/images/periodontitis-clinical-mild.jpg" alt="Fotografía clínica de un caso leve de periodontitis con recesión gingival" loading="lazy" /><span className="condition-figure-caption">Ejemplo clínico leve · Periodontitis</span></div><div className="condition-card-content"><span className="condition-kicker">TEJIDOS DE SOPORTE</span><h3>Periodontitis</h3><p>Puede afectar la encía y el hueso que sostienen los dientes. A veces se nota movilidad, sensibilidad o cambios al morder.</p><details className="condition-more"><summary>Saber más <ChevronDown size={16} /></summary><div><p>Un examen dental es necesario para evaluar los tejidos de soporte. La atención profesional puede ayudar a controlar la enfermedad y reducir su avance.</p><a href="https://www.cdc.gov/oral-health/about/gum-periodontal-disease.html" target="_blank" rel="noreferrer">Leer información de CDC <ArrowUpRight size={14} /></a></div></details><Link className="condition-cta" to="/citas" state={{ appointmentPrefill: { reason: 'other', patientNote: 'He notado cambios en mis encías o dientes y quisiera conversarlos en la cita.' } }}>Quiero conversar estos cambios <ArrowRight size={16} /></Link></div></article>
        </div>
        <p className="condition-source-note"><ShieldCheck size={15} /> Créditos: <a href="https://commons.wikimedia.org/wiki/File:Gingivitis.jpg" target="_blank" rel="noreferrer">Gingivitis, Roquex</a> (<a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0 1.0</a>) · <a href="https://commons.wikimedia.org/wiki/File:Mirna_parodontitida.jpg" target="_blank" rel="noreferrer">Periodontitis leve, D-institut</a> (<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>). La apariencia varía; <a href="https://www.cdc.gov/oral-health/about/gum-periodontal-disease.html" target="_blank" rel="noreferrer">consulta la guía de CDC</a> y solicita una evaluación para saber qué ocurre.</p>
      </section>
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
      <div className="faq-page-layout"><div className="faq-page-intro"><img className="faq-support-photo" src="/images/dental-consultation.jpg" alt="Odontólogo atendiendo a una paciente en consulta" loading="lazy" /><span className="faq-big-icon"><BookOpen size={25} /></span><h2>¿No encuentras tu respuesta?</h2><p>Tu odontólogo puede orientarte con información personalizada para tu salud bucal.</p><Link className="text-link" to="/contacto">Información de contacto <ArrowRight size={16} /></Link></div><div className="faq-list">{faqItems.map(([q, a]) => <details key={q}><summary>{q}<ChevronDown size={18} /></summary><p>{a}</p></details>)}</div></div>
      <div className="page-next"><SourceNote /><Link className="button button-primary" to="/higiene">Ver hábitos de higiene <ArrowRight size={17} /></Link></div>
    </div>
  )
}

function ContactPage() {
  return (
    <div className="content-wrap inner-page contact-page">
      <PageHeading kicker="ACOMPAÑAMIENTO PROFESIONAL" title="Tu salud bucal merece atención." subtitle="La orientación de un profesional ayuda a responder las preguntas sobre tu caso y definir los siguientes pasos." />
      <div className="contact-panel"><figure className="contact-photo"><img src="/images/dental-consultation.jpg" alt="Profesional dental explica una atención a una paciente" loading="lazy" /><figcaption>Una consulta empieza con una conversación</figcaption></figure><div className="contact-panel-copy"><span className="section-kicker">ATENCIÓN EN TRUJILLO · DATOS EN CONFIGURACIÓN</span><h2>Tu salud bucal merece atención.</h2><p>Perioalert permite reservar un horario y enviar una consulta en línea. La dirección y los canales oficiales de la clínica todavía deben configurarse; verifica esos datos con tu profesional antes de desplazarte.</p><p className="contact-setup-note"><ShieldCheck size={17} /> Los horarios se confirman en la agenda digital. La ubicación física de atención no está configurada aún.</p><Link className="text-link" to="/citas">Ver horarios disponibles <ArrowRight size={16} /></Link></div></div>
    </div>
  )
}

function NotFoundPage() {
  return <div className="content-wrap not-found"><div className="not-found-layout"><div><span className="section-kicker">PÁGINA NO ENCONTRADA</span><h1>Este camino no aparece en el mapa.</h1><p>Prueba con una de las guías disponibles.</p><Link className="button button-primary" to="/">Ir al inicio <ArrowRight size={17} /></Link></div><figure className="not-found-photo"><img src="/images/hero-brushing.jpg" alt="Una mujer se cepilla los dientes frente al espejo" loading="lazy" /><figcaption>Una rutina que te acompaña cada día</figcaption></figure></div></div>
}

function PrivacyPage() {
  return <div className="content-wrap inner-page privacy-page">
    <PageHeading kicker="INFORMACIÓN SOBRE TUS DATOS" title="Aviso de privacidad" subtitle="Borrador informativo del flujo de citas de Perioalert." />
    <section className="privacy-notice-card">
      <div className="privacy-demo-warning"><ShieldCheck size={18} /><p><strong>Este aviso está en modo demostración.</strong> Antes de recibir pacientes, la clínica debe completar su identidad legal, datos de contacto, finalidad, plazo de conservación y canal para ejercer derechos.</p></div>
      <h2>Qué datos se usan para solicitar una cita</h2>
      <p>Si inicias sesión y envías una solicitud, se guardan tu nombre completo, edad y, si decides proporcionarlo, tu DNI de ocho dígitos. También se guarda el correo que indiques para recibir la confirmación, junto con la fecha y hora elegidas, motivo general, descripción opcional y las fotos que adjuntes.</p>
      <h2>Para qué se usan</h2>
      <p>Al enviar el formulario, el horario seleccionado se reserva automáticamente. El correo indicado recibe la confirmación y un PDF con tu nombre, fecha, hora, motivo general y código de cita. El DNI, las fotos y tu descripción personal no se adjuntan al correo ni al PDF.</p>
      <h2>Dónde se guardan y quién puede verlos</h2>
      <p>Los datos de la cuenta, los datos identificativos, el correo de contacto y la cita se guardan en Supabase. Las fotos se guardan en un bucket privado. Solo el paciente y los perfiles autorizados de la clínica pueden consultar estos datos. El mensaje y el PDF incluyen solo el resumen de la cita descrito arriba.</p>
      <div className="privacy-photo-note"><img src="/images/brushing-model-closeup.jpg" alt="Cepillo colocado junto a la encía en un modelo dental de demostración" loading="lazy" /><div><h2>Qué no debes adjuntar</h2><p>No adjuntes imágenes de documentos de identidad, información financiera ni fotos de otras personas. El campo DNI del formulario es opcional y la clínica debe validar si lo necesita antes de aceptar datos reales. Adjunta solo fotos relacionadas con tu consulta.</p></div></div>
      <p className="card-footnote">Este borrador no reemplaza el aviso aprobado de la clínica. Antes del lanzamiento real, debe completar identidad legal, finalidad, necesidad de cada dato, conservación, responsable y canal para ejercer derechos.</p>
    </section>
  </div>
}

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { configured, user } = useAuth()
  useEffect(() => {
    if (!menuOpen) return
    document.body.classList.add('mobile-menu-open')
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.classList.remove('mobile-menu-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])
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
      '.hero-copy', '.hero-photo', '.welcome-grid > *', '.section-title-row', '.topic-card',
      '.member-intro', '.member-tool', '.home-cta-inner > div', '.page-heading', '.editorial-grid',
      '.article-content', '.callout', '.progress-section', '.timer-panel', '.routine-list > article',
      '.brushing-stage-card', '.hygiene-video-card', '.signals-list > *', '.condition-card', '.condition-explorer', '.consult-card', '.faq-page-layout > *', '.contact-panel', '.privacy-notice-card',
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
          <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}><span className="sr-only">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
          <nav id="site-nav" className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Navegación principal">
            <div className="mobile-nav-intro"><span>EXPLORA PERIOALERT</span><small>Información para cuidar tus encías</small></div>
            {navItems.map(({ to, label }, index) => <NavLink className="site-nav-link" key={to} to={to} onClick={() => setMenuOpen(false)}><span className="nav-mobile-index">0{index + 1}</span><span className="nav-link-label">{label}</span><ArrowUpRight className="nav-mobile-arrow" size={16} /></NavLink>)}
            <NavLink className="nav-cta" to={configured && user ? '/mi-salud' : '/cuenta'} onClick={() => setMenuOpen(false)}>{configured && user ? 'Mi espacio' : 'Acceso'} <ArrowUpRight size={15} /></NavLink>
            <div className="mobile-nav-footer"><ShieldCheck size={15} /><span>Contenido educativo · Atención profesional cuando la necesites</span></div>
          </nav>
        </div>
      </header>
      {menuOpen && <button className="mobile-menu-backdrop" type="button" aria-label="Cerrar menú de navegación" onClick={() => setMenuOpen(false)} />}
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
