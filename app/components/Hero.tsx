import { useEffect, useRef } from "react";
import { LogoBig } from "./ui/icons/LogoBig";
import { SpriteLogo } from "./ui/icons/SpriteLogo";

import wakandaMarvel from "../assets/marvel-theater.png";
import jungleBg from "../assets/jungleBg.mp4";

export default function Hero() {
  // Reference to the hero section element
  const sectionRef = useRef<HTMLElement | null>(null);

  // Reference to the background video element
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Scroll smoothly to the next scene when the button is clicked
  const handleEnter = () => {
    const next = document.querySelector('[data-scene="origin-stories"]');
    if (!next) return;
    next.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // requestAnimationFrame id for throttling mouse movement updates
  const rafRef = useRef<number | null>(null);

  // Stores the target parallax position
  const targetRef = useRef({ x: 0, y: 0 });

  // Track whether the section is visible in the viewport
  const visibleRef = useRef(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Observe visibility of the section to avoid unnecessary animations
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Detect if device supports precise pointer (mouse) for parallax
  const canParallax = () => {
    // coarse pointer = often trackpad/touch (not always, but a useful fallback)
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(pointer: coarse)").matches;
  };

  // Handle mouse movement and apply parallax transform to the video
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!videoRef.current) return;
    if (!visibleRef.current) return;
    if (!canParallax()) return;

    // Calculate offset relative to screen center
    const x = (e.clientX / window.innerWidth - 0.5) * 60;
    const y = (e.clientY / window.innerHeight - 0.5) * 60;
    targetRef.current = { x, y };

    // Prevent multiple RAF calls
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!videoRef.current) return;
      const { x, y } = targetRef.current;

      // Apply GPU-friendly transform
      videoRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.08)`;
    });
  };

  // Cleanup RAF on component unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Responsive height for logos
  const h = "clamp(24px, 3.2vw, 44px)";

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full overflow-hidden bg-[#060B12]"
    >
      {/* Background video with parallax */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/poster.jpg"
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      >
        <source src={jungleBg} type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Radial glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,255,140,0.20),transparent_55%)]" />

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-b from-transparent via-[#060B12]/75 to-[#060B12]" />

      {/* Main hero content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center">
        <div className="w-full max-w-5xl mx-auto">
          {/* Logos row */}
          <div className="flex items-center justify-center gap-6 pt-10">
            <SpriteLogo style={{ height: h }} className="w-auto opacity-95" />
            <span className="text-white/60 text-sm">×</span>
            <img
              src={wakandaMarvel}
              alt="Wakanda Forever"
              style={{ height: h }}
              className="w-auto object-contain opacity-95"
              loading="lazy"
            />
          </div>

          {/* Main logo */}
          <div className="mt-12 flex justify-center">
            <LogoBig className="drop-shadow-[0_0_22px_rgba(0,255,140,0.55)]" />
          </div>

          {/* Subtitle */}
          <p className="mt-6 text-white/80 tracking-[0.35em] text-xs sm:text-sm uppercase">
            Explore new paths. <br />
            Find your gift.
          </p>

          {/* Enter button */}
          <div className="mt-10 flex justify-center pb-28">
            <button
              onClick={handleEnter}
              className="px-10 py-4 text-sm tracking-[0.25em] uppercase text-white border border-emerald-400/60 rounded-md bg-emerald-500/10 backdrop-blur-md transition duration-300 hover:bg-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,255,140,0.45)]"
            >
              ENTER →
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center gap-3 text-white/70">
            <span className="text-[10px] tracking-[0.35em] uppercase">
              Scroll
            </span>
            <div className="h-10 w-px bg-white/35 relative overflow-hidden">
              <span className="absolute inset-x-0 top-0 h-4 bg-white/70 animate-[scrollLine_1.2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll animation keyframes */}
      <style>{`
        @keyframes scrollLine {
          0% { transform: translateY(-12px); opacity: 0; }
          35% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
