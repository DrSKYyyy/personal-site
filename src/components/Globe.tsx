import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "../lib/utils";

export default function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;
    let width = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 800,
      height: 800,
      phi: 0,
      theta: 0.3,
      dark: document.documentElement.getAttribute("data-theme") === "dark" ? 1 : 0,
      diffuse: 0.4,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [1, 1, 1],
      markerColor: [251 / 255, 100 / 255, 21 / 255],
      glowColor: [1, 1, 1],
      markers: [
        { location: [39.9042, 116.4074], size: 0.08 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [35.6762, 139.6503], size: 0.05 },
        { location: [51.5074, -0.1278], size: 0.08 },
        { location: [48.8566, 2.3522], size: 0.06 },
        { location: [-33.8688, 151.2093], size: 0.06 },
        { location: [55.7558, 37.6173], size: 0.06 },
      ],
      onRender: (state) => {
        phi += 0.005;
        state.phi = phi;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    const onResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
        canvas.width = width * 2;
        canvas.height = width * 2;
      }
    };
    onResize();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas.parentElement!);

    setTimeout(() => {
      canvas.style.opacity = "1";
    }, 100);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[500px]", className)}>
      <canvas
        ref={canvasRef}
        className="size-full opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        style={{ display: "block" }}
      />
    </div>
  );
}
