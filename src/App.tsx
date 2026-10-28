import { useState } from 'react'
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp,
  HeartHandshake, Menu, ShieldCheck, Sparkles, X,
} from 'lucide-react'

const links = [
  ['Periodontitis', '#periodontitis'],
  ['Higiene diaria', '#habitos'],
  ['Señales de alerta', '#senales'],
  ['Preguntas frecuentes', '#preguntas'],
] as const

function SmileIllustration() {
  return (
    <div className="illustration" role="img" aria-label="Ilustración de una sonrisa sana rodeada de hojas">
      <div className="sun-disc" />
      <svg className="leaf leaf-one" viewBox="0 0 120 170" aria-hidden="true">
        <path d="M103 8C30 16 4 59 12 112c6 35 37 50 58 34C104 119 100 47 103 8Z" />
        <path d="M15 142C38 101 62 62 98 19" />
      </svg>
      <svg className="leaf leaf-two" viewBox="0 0 120 170" aria-hidden="true">
        <path d="M103 8C30 16 4 59 12 112c6 35 37 50 58 34C104 119 100 47 103 8Z" />
        <path d="M15 142C38 101 62 62 98 19" />
      </svg>
      <div className="smile-card">
        <div className="smile-label"><span className="smile-mark"><Sparkles size={15} /></span> Una sonrisa empieza en tus encías</div>
        <svg className="smile-art" viewBox="0 0 440 300" role="img" aria-label="Ilustración de una sonrisa">
          <path className="gum" d="M67 109c30-26 71-39 153-39s123 13 153 39c-7 91-73 144-153 144S74 200 67 109Z" />
          <path className="mouth" d="M83 119c35-23 79-32 137-32s102 9 137 32c-16 62-66 107-137 107S99 181 83 119Z" />
          <path className="teeth" d="M92 116c28-17 70-25 128-25s100 8 128 25l-9 41c-2 10-10 16-21 15l-25-2c-10-1-17-8-19-18l-5-23h-17l-5 29c-2 10-9 17-20 17h-14c-11 0-18-7-20-17l-5-29h-17l-5 23c-2 10-9 17-19 18l-25 2c-11 1-19-5-21-15Z" />
          <path className="tooth-line" d="M144 96c-2 17-2 37 2 67m56-71c-2 18-1 38 3 59m40-59c2 18 1 38-3 59m54-55c2 17 2 37-2 67" />
          <path className="smile-line" d="M111 184c29 31 65 47 109 47s80-16 109-47" />
          <circle className="sparkle sparkle-a" cx="74" cy="71" r="7" />
          <path className="sparkle sparkle-b" d="M363 66v23m-11-11h23" />
        </svg>
        <div className="illustration-caption"><span className="caption-line" /> Prevención, todos los días</div>
      </div>
      <span className="float-dot dot-a" /><span className="float-dot dot-b" />
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <a className="skip-link" href="#contenido">Ir al contenido</a>
      <header className="site-header">
        <div className="nav-wrap">
          <a className="brand" href="#inicio" aria-label="Perioalert, inicio" onClick={closeMenu}>
            <span className="brand-icon"><span /></span>
            <span>perio<span className="brand-light">alert</span></span>
          </a>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}<span className="sr-only">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
          <nav id="site-nav" className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Navegación principal">
            {links.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
            <a className="nav-cta" href="#contacto" onClick={closeMenu}>Hablemos <ArrowUpRight size={15} /></a>
          </nav>
        </div>
      </header>

      <main id="contenido">
        <section className="hero section-wrap" id="inicio">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> BIENESTAR QUE EMPIEZA EN TUS ENCÍAS</div>
            <h1>Cuida tus encías,<br /><em>protege tu sonrisa.</em></h1>
            <p className="hero-lede">Pequeños cuidados diarios pueden hacer una gran diferencia. Aprende a reconocer las señales y a cuidar tu salud bucal con información clara.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#habitos">Aprende a cuidarte <ArrowRight size={17} /></a>
              <a className="text-link" href="#periodontitis">Conoce la periodontitis <ArrowDown size={15} /></a>
            </div>
            <div className="hero-note"><ShieldCheck size={17} /><span>Información educativa para acompañar tu cuidado</span></div>
          </div>
          <SmileIllustration />
          <a className="scroll-cue" href="#periodontitis"><span className="scroll-icon"><ArrowDown size={15} /></span> Sigue leyendo</a>
        </section>

        <section className="intro-band" id="periodontitis">
          <div className="section-wrap intro-grid">
            <div className="intro-aside"><span className="section-kicker">ENTENDER ES PREVENIR</span><span className="aside-rule" /></div>
            <div className="intro-main">
              <h2>La salud de tus encías<br />también es parte de tu salud.</h2>
              <div className="intro-body">
                <p>La enfermedad periodontal afecta los tejidos que sostienen los dientes. Puede avanzar poco a poco y, al inicio, no siempre causa molestias evidentes.</p>
                <p>Conocer las señales y mantener una higiene cuidadosa ayuda a tomar decisiones a tiempo. Solo un profesional puede evaluar tu caso y recomendar un tratamiento.</p>
              </div>
              <a className="under-link" href="#senales">Conoce las señales de alerta <ArrowRight size={16} /></a>
            </div>
            <div className="intro-stamp" aria-hidden="true"><HeartHandshake size={27} /><span>Cuidarte<br />es quererte</span></div>
          </div>
        </section>

        <section className="habits section-wrap" id="habitos">
          <div className="section-heading">
            <div><span className="section-kicker">TU RUTINA, A TU RITMO</span><h2>Cuidados sencillos.<br /><em>Un hábito a la vez.</em></h2></div>
            <p>No necesitas hacerlo perfecto; empezar con una rutina constante ya es un buen paso.</p>
          </div>
          <div className="habit-list">
            <article className="habit-row">
              <span className="habit-number">01</span><div className="habit-icon icon-blue"><Sparkles size={23} /></div>
              <div className="habit-copy"><h3>Cepíllate con suavidad</h3><p>Usa un cepillo de cerdas suaves y limpia con atención el borde donde se unen el diente y la encía.</p></div>
              <a href="#preguntas" aria-label="Más información sobre cepillado"><ArrowUpRight size={20} /></a>
            </article>
            <article className="habit-row">
              <span className="habit-number">02</span><div className="habit-icon icon-mint"><span className="floss-glyph">↗</span></div>
              <div className="habit-copy"><h3>Limpia entre tus dientes</h3><p>El hilo dental o los cepillos interdentales pueden llegar a espacios que el cepillo no alcanza.</p></div>
              <a href="#preguntas" aria-label="Más información sobre limpieza interdental"><ArrowUpRight size={20} /></a>
            </article>
            <article className="habit-row">
              <span className="habit-number">03</span><div className="habit-icon icon-peach"><CircleHelp size={23} /></div>
              <div className="habit-copy"><h3>Consulta si algo cambia</h3><p>Un profesional puede revisar tus encías y orientarte según tus necesidades.</p></div>
              <a href="#contacto" aria-label="Información de contacto"><ArrowUpRight size={20} /></a>
            </article>
          </div>
          <div className="tip-note"><span className="tip-check"><Check size={14} /></span><p>Si tienes dudas sobre una técnica, pide a tu odontólogo que te la muestre en consulta.</p></div>
        </section>

        <section className="alert-section" id="senales">
          <div className="section-wrap alert-grid">
            <div className="alert-copy"><span className="section-kicker">ESCUCHA A TU CUERPO</span><h2>¿Has notado<br /><em>algún cambio?</em></h2><p>Las encías pueden mostrar señales que vale la pena conversar con un profesional de salud bucal.</p><a className="button button-light" href="#contacto">Busca orientación <ArrowRight size={17} /></a></div>
            <div className="sign-list">
              <div className="sign-item"><span className="sign-mark">01</span><span>Sangrado al cepillarte o usar hilo dental</span><ArrowUpRight size={17} /></div>
              <div className="sign-item"><span className="sign-mark">02</span><span>Encías enrojecidas, sensibles o inflamadas</span><ArrowUpRight size={17} /></div>
              <div className="sign-item"><span className="sign-mark">03</span><span>Cambios en la posición de los dientes o en la mordida</span><ArrowUpRight size={17} /></div>
              <div className="sign-disclaimer"><ShieldCheck size={17} /><span>Estas señales no confirman un diagnóstico. Un odontólogo puede evaluarlas.</span></div>
            </div>
          </div>
        </section>

        <section className="faq section-wrap" id="preguntas">
          <div className="faq-heading"><span className="section-kicker">RESPUESTAS CLARAS</span><h2>Preguntas frecuentes</h2><p>Una guía breve para empezar a cuidar tus encías con confianza.</p></div>
          <div className="faq-list">
            <details><summary>¿La enfermedad de las encías siempre causa dolor?<ChevronDown size={18} /></summary><p>No necesariamente. Algunas enfermedades de las encías pueden avanzar con pocas molestias al principio. Si notas cambios, consulta a un profesional.</p></details>
            <details><summary>¿Con qué frecuencia debo visitar al odontólogo?<ChevronDown size={18} /></summary><p>La frecuencia depende de tu salud bucal y tus necesidades. Tu odontólogo puede recomendarte un calendario adecuado para ti.</p></details>
            <details><summary>¿Esta página puede decirme si tengo periodontitis?<ChevronDown size={18} /></summary><p>No. Este sitio ofrece información educativa general y no reemplaza un examen, diagnóstico o consejo profesional.</p></details>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="section-wrap contact-inner"><div><span className="section-kicker">EL SIGUIENTE PASO ES TUYO</span><h2>Tu sonrisa merece<br /><em>atención y cuidado.</em></h2></div><div className="contact-copy"><p>¿Necesitas orientación? Próximamente podrás solicitar una cita desde esta página. Mientras tanto, comunícate directamente con tu clínica dental.</p><span className="setup-note">Para habilitar citas en línea se necesitan los datos de contacto y disponibilidad de la clínica.</span></div></div>
        </section>
      </main>

      <footer className="site-footer"><div className="section-wrap footer-main"><a className="brand footer-brand" href="#inicio"><span className="brand-icon"><span /></span><span>perio<span className="brand-light">alert</span></span></a><p>Información para cuidar tus encías<br />y acompañar tu bienestar.</p><a href="#inicio" className="back-top">Volver arriba <ArrowUpRight size={15} /></a></div><div className="section-wrap footer-bottom"><span>© {new Date().getFullYear()} Perioalert</span><span className="medical-notice">Contenido educativo. No sustituye la evaluación de un profesional de salud. Fuentes: <a href="https://www.cdc.gov/oral-health/about/gum-periodontal-disease.html" target="_blank" rel="noreferrer">CDC</a> · <a href="https://www.nidcr.nih.gov/health-info/gum-disease" target="_blank" rel="noreferrer">NIDCR</a>.</span></div></footer>
    </>
  )
}

export default App
