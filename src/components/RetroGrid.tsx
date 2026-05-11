import { cn } from "../lib/utils"

interface RetroGridProps {
  className?: string
  angle?: number
  cellSize?: number
  opacity?: number
  lightLineColor?: string
  darkLineColor?: string
  lineThickness?: number
}

export function RetroGrid({
  className,
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
  lineThickness = 2,
}: RetroGridProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden",
        className
      )}
      style={{
        perspective: "200px",
        opacity: opacity,
        "--grid-angle": `${angle}deg`,
        "--cell-size": `${cellSize}px`,
        "--line-thick": `${lineThickness}px`,
        "--light-line": lightLineColor,
        "--dark-line": darkLineColor,
      } as React.CSSProperties}
    >
      <div
        className="absolute inset-0"
        style={{ transform: "rotateX(var(--grid-angle))" }}
      >
        <div
          className="animate-grid"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--light-line) var(--line-thick), transparent 0), linear-gradient(to bottom, var(--light-line) var(--line-thick), transparent 0)",
            backgroundRepeat: "repeat",
            backgroundSize: "var(--cell-size) var(--cell-size)",
            position: "absolute",
            inset: "-100% 0",
          }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(to top, var(--color-bg, white) 0%, transparent 90%)",
        }}
      />
    </div>
  )
}
