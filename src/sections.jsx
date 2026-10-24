import { useState } from 'react'

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
    if (phase !== 'idle') return
    setPhase('in')
    setTimeout(() => {
      const el = document.getElementById('contact')
      if (el) window.scrollTo({ top: el.offsetTop, behavior: 'instant' })
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
        <a className="btn btn-primary btn-sm" href="#contact" onClick={goToContact}>
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
          <a className="btn btn-primary" href="#contact">
            See My Process <ArrowIcon />
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

export function Cta() {
  return (
    <section id="contact" className="section cta-section">
      <div className="cta-banner reveal">
        <div>
          <h2>Have a project or task in mind?</h2>
          <p>Web apps or admin backlogs — let&apos;s get it done, no middlemen.</p>
        </div>
        <div className="cta-side">
          <span className="cta-status"><span className="badge-dot" /> Available Now</span>
          <a className="btn btn-primary" href="mailto:hello@van.dev">
            Get in Touch <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.05.78 2.12v3.14c0 .31.2.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
)

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.47 22H3.34l7.24-8.28L2.6 2h6.4l4.42 5.85L18.9 2zm-1.1 18.1h1.73L7.62 3.8H5.75l12.05 16.3z" />
  </svg>
)

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
          <a href="#top">Contact</a>
        </div>
        <div>
          <h4>Follow Me</h4>
          <div className="socials">
            <a href="https://github.com/vanramones" target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><LinkedinIcon /></a>
            <a href="https://x.com" aria-label="X"><XIcon /></a>
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
