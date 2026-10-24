import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export const FRAME_COUNT = 240
const IMAGE_ASPECT = 16 / 9
const frameUrl = (i) => `/frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`

function nearestLoaded(textures, index) {
  if (textures[index].image) return index
  for (let d = 1; d < textures.length; d++) {
    const lo = index - d
    const hi = index + d
    if (lo >= 0 && textures[lo].image) return lo
    if (hi < textures.length && textures[hi].image) return hi
  }
  return -1
}

export default function Frames() {
  const material = useRef()
  const playback = useRef({ current: 0, last: -1 })

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return Array.from({ length: FRAME_COUNT }, (_, i) => {
      const tex = loader.load(frameUrl(i))
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = false
      return tex
    })
  }, [])

  const viewport = useThree((s) => s.viewport)

  const screenAspect = viewport.width / viewport.height
  let w, h
  if (screenAspect > IMAGE_ASPECT) {
    w = viewport.width
    h = w / IMAGE_ASPECT
  } else {
    h = viewport.height
    w = h * IMAGE_ASPECT
  }

  useFrame(() => {
    const p = playback.current
    const max = document.documentElement.scrollHeight - window.innerHeight
    const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
    const target = progress * (FRAME_COUNT - 1)

    p.current += (target - p.current) * 0.12
    if (Math.abs(target - p.current) < 0.01) p.current = target

    const index = nearestLoaded(textures, Math.round(p.current))
    if (index !== -1 && index !== p.last) {
      material.current.map = textures[index]
      material.current.needsUpdate = true
      p.last = index
    }
  })

  return (
    <mesh scale={[w, h, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={material} toneMapped={false} />
    </mesh>
  )
}
