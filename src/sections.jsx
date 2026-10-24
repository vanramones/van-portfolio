import { useState } from 'react'

export const CONTACT_HASH = '#/contact'

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
  </svg>
)

export function Nav() {
  const [phase, setPhase] = useState('idle')

  const goToContact = (e) => {
    e.preventDefault()
    if (phase !== 'idle' || window.location.hash === CONTACT_HASH) return
    setPhase('in')
    setTimeout(() => {
      window.location.hash = CONTACT_HASH
      setPhase('out')
      setTimeout(() => setPhase('idle'), 500)
    }, 1400)
  }

  return (
    <>
    {phase !== 'idle' && (
      <div className={`loader ${phase === 'out' ? 'loader-out' : ''}`} role="status" aria-live="polite">
        <span className="loader-logo">
          Van<span>.dev</span>
        </span>
        <span className="loader-bar"><span /></span>
      </div>
    )}
    <header className="nav">
      <a className="logo" href="#top">
        Van<span>.dev</span>
      </a>
      <nav className="nav-links">
        <a href="#work">Work</a>
        <a href="#process">Process</a>
        <a href="#testimonials">Testimonials</a>
      </nav>
      <div className="nav-actions">
        <a
          className="nav-icon"
          href="https://github.com/vanramones"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <GithubIcon />
        </a>
        <a className="btn btn-primary btn-sm" href={CONTACT_HASH} onClick={goToContact}>
          Let&apos;s Talk
        </a>
      </div>
    </header>
    </>
  )
}

export function Hero() {
  const [active, setActive] = useState(0)

  return (
    <section id="top" className="section hero">
      <div className="hero-split reveal">
      <div className="hero-inner">
        <span className="badge">
          <span className="badge-dot" /> Available for new projects
        </span>
        <h1>
          Full-Stack Developer.
          <br />
          <span className="grad">&amp; Reliable VA.</span>
        </h1>
        <p className="lede">
          I build web apps with React, TypeScript and Express — and work as a
          virtual assistant handling product listings, admin tasks and data
          entry, keeping your CRM clean and organized.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#work">
            View My Work <ArrowIcon />
          </a>
          <span className="chip">Remote-friendly • Open to work</span>
        </div>
        <ul className="hero-checks">
          <li><CheckIcon /> React • TypeScript • Express</li>
          <li><CheckIcon /> Product Listing</li>
          <li><CheckIcon /> Admin &amp; Data Entry</li>
          <li><CheckIcon /> CRM Organization</li>
        </ul>
      </div>
      <div className="hero-certs-wrap">
        <span className="certs-label">My Certificates</span>
        <div
          className="hero-certs"
          onClick={() => setActive((a) => (a + 1) % CERTS.length)}
          title="Click to see next certificate"
        >
        {CERTS.map((c, i) => {
          const d = (i - active + CERTS.length) % CERTS.length
          return (
            <img
              key={c.title}
              src={c.img}
              alt={c.title}
              style={{
                transform: `translate(${d * 14}px, ${d * -12}px) rotate(${d * 4}deg) scale(${1 - d * 0.03})`,
                zIndex: CERTS.length - d,
                opacity: d > 2 ? 0 : 1 - d * 0.18,
              }}
            />
          )
        })}
        </div>
      </div>
      </div>
    </section>
  )
}

const FEATURES = [
  {
    title: 'Full-Stack Developer',
    text: 'End-to-end web apps built with React, TypeScript and Express.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'Product Listing',
    text: 'Accurate, well-organized product listings for your e-commerce store.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    title: 'Admin & Data Entry',
    text: 'Fast, dependable admin support with error-free data entry.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="15" y2="16" />
      </svg>
    ),
  },
  {
    title: 'CRM Management',
    text: 'Contacts, pipelines and records kept clean, sorted and up to date.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
]

export function Features() {
  return (
    <section id="work" className="section">
      <div className="section-inner reveal">
        <h2 className="section-title">
          Everything I Bring to
          <br />
          <span className="grad">Every Project</span>
        </h2>
        <div className="cards">
          {FEATURES.map((f, i) => (
            <div className="card" key={f.title} style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="card-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const CHECKLIST = [
  'Plan & build apps with React, TypeScript & Express',
  'List products accurately and on schedule',
  'Enter and verify data — zero sloppiness',
  'Keep your CRM clean, sorted & up to date',
]

export function Process() {
  return (
    <section id="process" className="section">
      <div className="section-inner split reveal">
        <div className="code-card">
          <div className="code-card-bar">
            <span /><span /><span />
          </div>
          <pre>{`const freelancer = {
  name: 'Van',
  role: 'Full-Stack Developer & VA',
  stack: ['React', 'TypeScript', 'Express'],
  va: ['product listing', 'data entry', 'CRM'],
  coffee: true,
  available: true,
}`}</pre>
        </div>
        <div className="split-copy">
          <span className="badge badge-sm">Inside my workflow</span>
          <h2 className="section-title left">
            How I Handle
            <br />
            <span className="grad">Dev Work &amp; Admin Tasks</span>
          </h2>
          <ul className="checklist">
            {CHECKLIST.map((item) => (
              <li key={item}>
                <span className="check-box"><CheckIcon /></span> {item}
              </li>
            ))}
          </ul>
          <a className="btn btn-primary" href={CONTACT_HASH}>
            Work With Me <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}

const STATS = [
  { value: '10+', label: 'Projects Completed' },
  { value: '300+', label: 'Products Listed' },
  { value: '5+', label: 'Happy Clients' },
]

export function Proof() {
  return (
    <section id="testimonials" className="section">
      <div className="section-inner reveal">
        <h2 className="section-title">
          Trusted by Clients
          <br />
          <span className="grad">&amp; Small Businesses</span>
        </h2>
        <div className="proof-row">
          <div className="stats">
            {STATS.map((s) => (
              <div className="stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <blockquote className="testimonial">
            <div className="stars">
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
            </div>
            <p>
              &ldquo;Van handles our product listings and keeps our CRM updated —
              tasks that used to pile up are now always done on time. He&apos;s
              easy to work with and very dependable.&rdquo;
            </p>
            <footer>
              <span className="avatar">SM</span>
              <span>
                <strong>Sarah M.</strong>
                <small>Online Store Owner</small>
              </span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

const CERTS = [
  {
    img: '/certs/cert-appkademiya-tpm.jpg',
    title: 'Certified Technical Project Manager',
    issuer: 'Appkademiya',
    year: 'Aug 2026',
  },
  {
    img: '/certs/cert-google-tech-support.jpg',
    title: 'Technical Support Fundamentals',
    issuer: 'Google via Coursera',
    year: 'Sep 2026',
  },
  {
    img: '/certs/cert-claude-code-101.jpg',
    title: 'Claude Code 101',
    issuer: 'Claude Academy',
    year: 'Oct 2026',
  },
  {
    img: '/certs/cert-claude-ai-capabilities.jpg',
    title: 'AI Capabilities & Limitations',
    issuer: 'Claude Academy',
    year: 'Oct 2026',
  },
  {
    img: '/certs/cert-nssu-research-seminar.jpg',
    title: 'Research Seminar: Capstone Foundations',
    issuer: 'Northwest Samar State University',
    year: 'Feb 2026',
  },
  {
    img: '/certs/cert-nssu-ip-bootcamp.jpg',
    title: 'OWN IT: Intellectual Property Bootcamp',
    issuer: 'Northwest Samar State University',
    year: 'Sep 2026',
  },
]

const ACCEPT = '.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.fig'
const MAX_FILES = 5
const MAX_SIZE = 10 * 1024 * 1024
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT

const formatSize = (b) => (b < 1024 * 1024 ? `${Math.ceil(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`)

export function Contact() {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', text: '' })

  const addFiles = (list) => {
    const ext = ACCEPT.split(',')
    const incoming = [...list].filter((f) => ext.some((e) => f.name.toLowerCase().endsWith(e)))
    const tooBig = incoming.filter((f) => f.size > MAX_SIZE)
    const ok = incoming.filter((f) => f.size <= MAX_SIZE)
    const merged = [...files, ...ok.filter((f) => !files.some((p) => p.name === f.name && p.size === f.size))]
    if (merged.length > MAX_FILES) setStatus({ type: 'error', text: `Up to ${MAX_FILES} files only.` })
    else if (tooBig.length) setStatus({ type: 'error', text: `${tooBig[0].name} is over 10 MB.` })
    else if (incoming.length < list.length) setStatus({ type: 'error', text: 'Some files have an unsupported type.' })
    else setStatus({ type: 'idle', text: '' })
    setFiles(merged.slice(0, MAX_FILES))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!ENDPOINT) {
      setStatus({ type: 'error', text: 'The contact form is not connected yet. Please try again later.' })
      return
    }
    const data = new FormData(form)
    data.delete('attachments')
    files.forEach((f) => data.append('attachments', f))
    setStatus({ type: 'sending', text: 'Sending…' })
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(res.statusText)
      form.reset()
      setFiles([])
      setStatus({ type: 'success', text: 'Message sent! I’ll get back to you soon.' })
    } catch {
      setStatus({ type: 'error', text: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <section id="contact" className="section">
      <div className="contact reveal">
        <div className="contact-copy">
          <a className="back-link" href="#top">← Back to home</a>
          <span className="cta-status"><span className="badge-dot" /> Available Now</span>
          <h2>Have a project or task in mind?</h2>
          <p>
            Web apps or admin backlogs — tell me about it. Attach your PDFs, interface
            designs, documents, guides or objectives and I&apos;ll review them.
          </p>
          <ul className="checklist">
            <li><span className="check-box"><CheckIcon /></span> Reply within 24 hours</li>
            <li><span className="check-box"><CheckIcon /></span> Your files stay private</li>
          </ul>

          <div className="direct">
            <h3>Or reach me directly</h3>
            <div className="direct-row">
              <a className="qr" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
                <img src="/telegram-qr.png" alt="Telegram QR code for @vanramones" />
              </a>
              <div className="direct-links">
                <small>Scan to chat on Telegram</small>
                <a className="direct-link" href={TELEGRAM_URL} target="_blank" rel="noreferrer">
                  <TelegramIcon /> @vanramones
                </a>
                <a className="direct-link" href={FACEBOOK_URL} target="_blank" rel="noreferrer">
                  <FacebookIcon /> Vann Ramones
                </a>
              </div>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={onSubmit}>
          <div className="field-row">
            <label className="field">
              <span>Name</span>
              <input name="name" type="text" required autoComplete="name" placeholder="Your name" />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
            </label>
          </div>
          <label className="field">
            <span>Subject</span>
            <input name="subject" type="text" required placeholder="e.g. Landing page redesign" />
          </label>
          <label className="field">
            <span>Message</span>
            <textarea name="message" rows="5" required placeholder="Tell me about your project, goals and timeline…" />
          </label>

          <label
            className={`dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          >
            <input
              name="attachments"
              type="file"
              multiple
              accept={ACCEPT}
              onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
            />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <strong>Drop files here or click to upload</strong>
            <small>PDF, interface designs, documents, guides, objectives — up to {MAX_FILES} files, 10 MB each</small>
          </label>

          {files.length > 0 && (
            <ul className="file-list">
              {files.map((f) => (
                <li key={f.name + f.size}>
                  <span className="file-name">{f.name}</span>
                  <span className="file-size">{formatSize(f.size)}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => setFiles((prev) => prev.filter((p) => p !== f))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="form-footer">
            {status.text && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
            <button className="btn btn-primary" type="submit" disabled={status.type === 'sending'}>
              {status.type === 'sending' ? 'Sending…' : 'Send Message'} <ArrowIcon />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.05.78 2.12v3.14c0 .31.2.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
  </svg>
)

const TelegramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z" />
  </svg>
)

const FACEBOOK_URL = 'https://www.facebook.com/Vann.Ramones'
const TELEGRAM_URL = 'https://t.me/vanramones'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <a className="logo" href="#top">
            Van<span>.dev</span>
          </a>
          <p className="footer-blurb">
            Full-stack web developer &amp; virtual assistant — building React/Express
            apps and keeping your data organized.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <a href="#work">Work</a>
          <a href="#process">Process</a>
          <a href="#testimonials">Testimonials</a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="#top">Terms of Use</a>
          <a href="#top">Privacy Policy</a>
          <a href={CONTACT_HASH}>Contact</a>
        </div>
        <div>
          <h4>Follow Me</h4>
          <div className="socials">
            <a href="https://github.com/vanramones" target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon /></a>
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon /></a>
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" aria-label="Telegram"><TelegramIcon /></a>
          </div>
          <a href="https://github.com/vanramones" target="_blank" rel="noreferrer">
            github.com/vanramones
          </a>
        </div>
      </div>
      <p className="copyright">© 2026 Van. All rights reserved.</p>
    </footer>
  )
}
