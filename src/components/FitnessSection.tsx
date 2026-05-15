import { useEffect, useRef, useState } from "react"
import { AnimatedCircularProgressBar } from "./AnimatedCircularProgressBar"

interface FitnessItem {
  label: string
  current: number
  target: number
  unit: string
}

export default function FitnessSection({ items }: { items: FitnessItem[] }) {
  const [isDark, setIsDark] = useState(false)
  const [values, setValues] = useState<number[]>(() => items.map(() => 0))
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafIds = useRef<(number | null)[]>([])
  const startTimes = useRef<(number | null)[]>([])
  const targets = useRef<number[]>([])

  targets.current = items.map((item) =>
    Math.min(Math.round((item.current / item.target) * 100), 100),
  )

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark")
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    rafIds.current = items.map(() => null)
    startTimes.current = items.map(() => null)
  }, [items])

  useEffect(() => {
    const animate = (index: number) => {
      const target = targets.current[index]
      startTimes.current[index] = performance.now()
      const duration = 1200

      function step(now: number) {
        const start = startTimes.current[index]
        if (start === null) return

        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = eased * target

        setValues((prev) => {
          const next = [...prev]
          next[index] = current
          return next
        })

        if (progress < 1) {
          rafIds.current[index] = requestAnimationFrame(step)
        }
      }

      rafIds.current[index] = requestAnimationFrame(step)
    }

    const observers = items.map((_, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            animate(index)
          } else {
            if (rafIds.current[index]) {
              cancelAnimationFrame(rafIds.current[index]!)
              rafIds.current[index] = null
            }
            startTimes.current[index] = null
            setValues((prev) => {
              const next = [...prev]
              next[index] = 0
              return next
            })
          }
        },
        { threshold: 0.3 },
      )
      if (cardRefs.current[index]) {
        observer.observe(cardRefs.current[index])
      }
      return observer
    })

    return () => {
      observers.forEach((o) => o.disconnect())
      rafIds.current.forEach((id) => {
        if (id) cancelAnimationFrame(id)
      })
    }
  }, [items])

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {items.map((item, index) => (
        <div
          className="card"
          key={item.label}
          ref={(el) => {
            cardRefs.current[index] = el
          }}
        >
          <h3
            style={{
              textAlign: "center",
              fontSize: "1rem",
              marginBottom: "1rem",
            }}
          >
            {item.label}
          </h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AnimatedCircularProgressBar
              value={values[index]}
              gaugePrimaryColor="#5DADE2"
              gaugeSecondaryColor={
                isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"
              }
            />
          </div>
          <p
            style={{
              textAlign: "right",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginTop: "0.75rem",
              color: "var(--color-primary)",
            }}
          >
            {item.current}/{item.target} {item.unit}
          </p>
        </div>
      ))}
    </div>
  )
}
