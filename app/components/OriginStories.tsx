// OriginStories.tsx
import React, { useRef } from "react";
import TiltedCard from "./ui/TiltedCard";
import Plasma from "./Plasma";

import hannah from "../assets/beachler.webp";
import jasmine from "../assets/alexia.webp";
import alicia from "../assets/Screenshot 2026-02-12 at 10.34.50.png";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function OriginStories() {
  // Section root ref (used as GSAP scope + event target)
  const main = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = main.current;
      if (!root) return;

      // TEXT (scroll): animate letter-spacing as the section scrolls through view
      const lede = root.querySelector(".origin-lede") as HTMLElement | null;
      if (lede) gsap.set(lede, { letterSpacing: "0.08em" });

      if (lede) {
        gsap.to(lede, {
          letterSpacing: "0.22em",
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      // CARDS (scroll): slide + fade each card into place as it enters viewport
      const items = gsap.utils.toArray<HTMLElement>(".origin-item", root);

      // Initial off-screen state for all items
      gsap.set(items, {
        opacity: 0,
        x: -540,
        y: 28,
        willChange: "transform, opacity",
      });

      // Per-item reveal animation tied to scroll position
      items.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            end: "top 45%",
            scrub: 1.1,
            invalidateOnRefresh: true,
          },
        });
      });

      // PLASMA PARALLAX (pointer): subtle parallax movement + rotation, throttled via rAF
      const plasmaWrap = root.querySelector(".plasma-wrap") as HTMLElement | null;
      if (!plasmaWrap) return;

      // Base transform values for plasma layer
      gsap.set(plasmaWrap, {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1.1,
        transformOrigin: "50% 50%",
        willChange: "transform",
      });

      // quickTo creates performant tweened setters (smooths movement without manual tweens each event)
      const toX = gsap.quickTo(plasmaWrap, "x", { duration: 0.55, ease: "power3.out" });
      const toY = gsap.quickTo(plasmaWrap, "y", { duration: 0.55, ease: "power3.out" });
      const toR = gsap.quickTo(plasmaWrap, "rotate", { duration: 0.75, ease: "power3.out" });

      // Movement intensity
      const strength = 48;
      const rotStrength = 2.2;

      // rAF throttle state
      let raf: number | null = null;

      // Last normalized pointer delta from center (-1..1 range)
      let last = { dx: 0, dy: 0 };

      // Pointer move: compute normalized position within section and update target deltas
      const handleMove = (e: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width;
        const my = (e.clientY - rect.top) / rect.height;
        last.dx = (mx - 0.5) * 2;
        last.dy = (my - 0.5) * 2;

        // Only one RAF at a time (reduces event spam)
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          toX(last.dx * strength);
          toY(last.dy * strength);
          toR(last.dx * rotStrength);
        });
      };

      // Pointer leave: cancel pending RAF and reset transforms to neutral
      const handleLeave = () => {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        toX(0);
        toY(0);
        toR(0);
      };

      // Attach pointer listeners to the section
      root.addEventListener("pointermove", handleMove);
      root.addEventListener("pointerleave", handleLeave);

      // Fade in plasma background as section approaches viewport
      gsap.fromTo(
        plasmaWrap,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 85%",
            end: "top 55%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Refresh ScrollTrigger on next frame to ensure all measurements are correct
      requestAnimationFrame(() => ScrollTrigger.refresh());

      // Cleanup: remove listeners + cancel RAF on unmount / scope revert
      return () => {
        root.removeEventListener("pointermove", handleMove);
        root.removeEventListener("pointerleave", handleLeave);
        if (raf) cancelAnimationFrame(raf);
      };
    },
    { scope: main } // Scope selectors/animations to this component instance
  );

  return (
    <section
      ref={main}
      data-scene="origin-stories"
      className="relative w-full bg-[#060B12] text-white overflow-hidden"
    >
      {/* TOP FADE: soft gradient to blend from previous section */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[18vh] z-[3] bg-gradient-to-b from-[#060B12] to-transparent" />

      {/* PLASMA BACKGROUND: animated layer + masking + grain */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <div className="plasma-wrap absolute inset-0">
          {/* Wrapper gives Plasma a real size and controls blend/opacity */}
          <div className="absolute inset-0 opacity-[0.55] mix-blend-screen">
            <Plasma
              color="#10ff8c"
              speed={0.7}
              direction="forward"
              scale={1.15}
              opacity={0.9}
              mouseInteractive={true}
              // You can force quality downscale on some machines:
              // qualityDownscale={1.9}
            />
          </div>

          {/* Dark vignette for cinematic depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.85)_100%)]" />

          {/* Noise overlay for texture */}
          <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay bg-[url('/noise.png')] bg-repeat" />
        </div>

        {/* MASK: fade-in plasma from top so it doesn't start abruptly */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 100%)",
          }}
        />
      </div>

      {/* BOTTOM FADE: blend into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] z-[3] bg-gradient-to-b from-transparent via-[#060B12]/75 to-[#060B12]" />

      {/* CONTENT: header + cards */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
        <div className="origin-header text-center max-w-2xl mx-auto">
          {/* Section label */}
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/60">ORIGIN STORIES</p>

          {/* Title */}
          <h2 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-tight">
            Craft Behind the Atmosphere
          </h2>

          {/* Lede line (letter-spacing animates on scroll) */}
          <p className="origin-lede mt-5 text-white/70 text-sm sm:text-base tracking-[0.08em] uppercase">
            Three roles. One cinematic language. Scroll to reveal.
          </p>

          {/* Divider */}
          <div className="mt-10 flex justify-center">
            <div className="h-px w-24 bg-emerald-400/40" />
          </div>
        </div>

        {/* Cards list (each .origin-item animates in on scroll) */}
        <div className="mt-16 flex flex-col items-center gap-16">
          <div className="origin-item">
            <div className="origin-card-inner w-fit">
              <TiltedCard
                imageSrc={hannah}
                altText="Hannah Beachler"
                captionText="Hannah Beachler"
                containerHeight="300px"
                containerWidth="300px"
                imageHeight="300px"
                imageWidth="300px"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip
                displayOverlayContent
                overlayContent={
                  <p className="tilted-card-demo-text">
                    Hannah Beachler <br />
                    <span>production designer</span>
                  </p>
                }
              />
            </div>
          </div>

          <div className="origin-item">
            <div className="origin-card-inner w-fit">
              <TiltedCard
                imageSrc={jasmine}
                altText="Jasmine Alexia"
                captionText="Jasmine Alexia"
                containerHeight="300px"
                containerWidth="300px"
                imageHeight="300px"
                imageWidth="300px"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip
                displayOverlayContent
                overlayContent={
                  <p className="tilted-card-demo-text">
                    Jasmine Alexia <br />
                    <span>storyboard artist</span>
                  </p>
                }
              />
            </div>
          </div>

          <div className="origin-item">
            <div className="origin-card-inner w-fit">
              <TiltedCard
                imageSrc={alicia}
                altText="Alícia Díaz"
                captionText="Alícia Díaz"
                containerHeight="300px"
                containerWidth="300px"
                imageHeight="300px"
                imageWidth="300px"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip
                displayOverlayContent
                overlayContent={
                  <p className="tilted-card-demo-text">
                    Alícia Díaz <br />
                    <span>sculptor</span>
                  </p>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
