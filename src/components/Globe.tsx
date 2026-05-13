import { useEffect, useRef, useState } from "react"
import createGlobe, { type COBEOptions } from "cobe"
import { useMotionValue, useSpring } from "motion/react"

import { cn } from "../lib/utils"

const MOVEMENT_DAMPING = 1400

const LIGHT_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [],
}

const DARK_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 20000,
  mapBrightness: 6,
  baseColor: [0.2, 0.25, 0.38],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [0.25, 0.3, 0.45],
  markers: [],
}

export function Globe({
  className,
  location = { lat: 31.8206, lng: 117.2272 },
}: {
  className?: string
  location?: { lat: number; lng: number }
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)
  const widthRef = useRef(0)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [isDark, setIsDark] = useState(false)

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const markers = [
    { location: [location.lat, location.lng], size: 0.08 },
  ]

  const currentConfig = isDark ? DARK_CONFIG : LIGHT_CONFIG

  const mergedConfig = {
    ...currentConfig,
    markers,
  }

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth
      }
    }

    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...mergedConfig,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state) => {
        if (!pointerInteracting.current) phiRef.current += 0.005
        state.phi = phiRef.current + rs.get()
        state.width = widthRef.current * 2
        state.height = widthRef.current * 2
      },
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"), 0)
    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [rs, mergedConfig])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-square w-full max-w-150",
        className
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
