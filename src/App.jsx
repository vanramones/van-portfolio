import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Frames from './Scene.jsx'
import { Nav, Hero, About, Features, Process, Proof, Contact, Footer, CONTACT_HASH } from './sections.jsx'

const getRoute = () => (window.location.hash === CONTACT_HASH ? 'contact' : 'home')

function useRoute() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    const anchor = route === 'home' && window.location.hash.length > 1
      ? document.getElementById(window.location.hash.slice(1))
      : null
    if (anchor) anchor.scrollIntoView({ behavior: 'instant' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route])

  return route
}

function useReveal(route) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [route])
}

export default function App() {
  const route = useRoute()
  useReveal(route)

  const [splash, setSplash] = useState('in')
  const start = useRef(Date.now())
  const hidden = useRef(false)

  const hideSplash = useCallback(() => {
    if (hidden.current) return
    hidden.current = true
    const wait = Math.max(0, 1600 - (Date.now() - start.current))
    setTimeout(() => setSplash('out'), wait)
  }, [])

  useEffect(() => {
    const fallback = setTimeout(hideSplash, 5000)
    return () => clearTimeout(fallback)
  }, [hideSplash])

  useEffect(() => {
    if (splash !== 'out') return
    const t = setTimeout(() => setSplash('done'), 550)
    return () => clearTimeout(t)
  }, [splash])

  return (
    <>
      {splash !== 'done' && (
        <div className={`loader ${splash === 'out' ? 'loader-out' : ''}`} role="status" aria-live="polite">
          <span className="loader-logo">
            Van<span>.dev</span>
          </span>
          <span className="loader-bar"><span /></span>
        </div>
      )}
      <div className="bg-canvas">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
          <Frames onFirstFrame={hideSplash} />
        </Canvas>
        <div className="scrim" />
      </div>

      <Nav />
      {route === 'contact' ? (
        <main>
          <Contact />
        </main>
      ) : (
        <main>
          <Hero />
          <About />
          <Features />
          <Process />
          <Proof />
        </main>
      )}
      <Footer />
    </>
  )
}
