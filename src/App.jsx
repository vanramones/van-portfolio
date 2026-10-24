import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Frames from './Scene.jsx'
import { Nav, Hero, Features, Process, Proof, Cta, Footer } from './sections.jsx'

function useReveal() {
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
  }, [])
}

export default function App() {
  useReveal()

  return (
    <>
      <div className="bg-canvas">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
          <Frames />
        </Canvas>
        <div className="scrim" />
      </div>

      <Nav />
      <main>
        <Hero />
        <Features />
        <Process />
        <Proof />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
