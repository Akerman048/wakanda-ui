import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function VideoBlock() {
  // Ref to the section container (used as GSAP scope + ScrollTrigger trigger)
  const container = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = container.current;
      if (!el) return;

      // Target element that will be scaled / rounded during scroll
      const video = el.querySelector(".video-scale");

      // Set initial (collapsed) state before scroll animation starts
      gsap.set(video, {
        scale: 0.15,
        borderRadius: "28px",
      });

      // Animate to full size + squared corners as user scrolls into the section
      gsap.to(video, {
        scale: 1,
        borderRadius: "0px",
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 70%", // when section top hits 70% of viewport height
          end: "top 10%",   // when section top hits 10% of viewport height
          scrub: 1.2,       // tie animation progress to scroll with smoothing
        },
      });
    },
    { scope: container } // scopes selectors to this component instance
  );

  return (
    <section
      ref={container}
      className="relative w-full bg-[#060B12] py-40 overflow-hidden"
    >
      {/* TOP FADE: inverted gradient to blend with the previous section */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40vh] z-10 bg-gradient-to-t from-transparent via-[#060B12]/75 to-[#060B12]" />

      {/* VIDEO: centered responsive wrapper */}
      <div className="relative z-20 flex justify-center">
        {/* This element is the GSAP animation target (.video-scale) */}
        <div className="video-scale will-change-transform w-[90vw] max-w-[1400px] aspect-video shadow-2xl overflow-hidden">
          {/* YouTube embed configured for autoplay + muted + loop */}
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/eyutr0dRv9o?autoplay=1&mute=1&controls=0&loop=1&playlist=eyutr0dRv9o"
            title="YouTube video player"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* BOTTOM FADE: blend into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] z-10 bg-gradient-to-b from-transparent via-[#060B12]/75 to-[#060B12]" />
    </section>
  );
}
