import type { SpringOptions } from "motion/react";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface TiltedCardProps {
  // Image source passed to the <img />
  imageSrc: React.ComponentProps<"img">["src"];
  // Accessible alt text for the image
  altText?: string;
  // Tooltip text (figcaption)
  captionText?: string;
  // Outer figure size
  containerHeight?: React.CSSProperties["height"];
  containerWidth?: React.CSSProperties["width"];
  // Image size
  imageHeight?: React.CSSProperties["height"];
  imageWidth?: React.CSSProperties["width"];
  // Scale factor when hovering
  scaleOnHover?: number;
  // Max rotation amount (deg) for tilt effect
  rotateAmplitude?: number;
  // Show “not optimized for mobile” warning
  showMobileWarning?: boolean;
  // Show tooltip near pointer
  showTooltip?: boolean;
  // Optional overlay node on top of the image
  overlayContent?: React.ReactNode;
  // Whether to render overlayContent
  displayOverlayContent?: boolean;
}

// Spring settings shared across motion values
const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

// Utility to constrain a value between min and max
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.06,
  rotateAmplitude = 11,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
}: TiltedCardProps) {
  // Ref to the root figure element (used for measuring + pointer math)
  const ref = useRef<HTMLElement>(null);

  // Tooltip position (in local element coordinates)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Tilt rotations (sprung for smoothness)
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);

  // Hover scale + tooltip opacity
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);

  // Small rotation “wobble” for the tooltip based on pointer velocity
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });

  // Store the last Y-derived value to compute velocity (avoids re-renders)
  const lastYRef = useRef(0);

  // requestAnimationFrame throttle id
  const rafRef = useRef<number | null>(null);

  // Latest pointer position captured from events (applied on next rAF)
  const targetRef = useRef({ clientX: 0, clientY: 0 });

  // Cached bounding rect for performance (especially Safari)
  const rectRef = useRef<DOMRect | null>(null);

  // Measure and cache the figure’s bounding box
  const measure = () => {
    if (!ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
  };

  useEffect(() => {
    // Update cached rect on scroll/resize so pointer math stays accurate
    const onScroll = () => measure();
    const onResize = () => measure();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Apply the tilt/tooltip updates using the last captured pointer position
  function applyFromTarget() {
    rafRef.current = null;
    if (!ref.current) return;

    // If rect isn't measured yet, measure once
    if (!rectRef.current) measure();
    const rect = rectRef.current;
    if (!rect) return;

    const { clientX, clientY } = targetRef.current;

    // Clamp pointer coordinates inside the card (helps with trackpads / fast motion)
    const localX = clamp(clientX - rect.left, 0, rect.width);
    const localY = clamp(clientY - rect.top, 0, rect.height);

    // Normalize to -1..1 range around the center
    const dx = (localX / rect.width - 0.5) * 2;
    const dy = (localY / rect.height - 0.5) * 2;

    // Clamp rotations to avoid excessive tilt
    const rotY = clamp(dx * rotateAmplitude, -rotateAmplitude, rotateAmplitude);
    const rotX = clamp(dy * -rotateAmplitude, -rotateAmplitude, rotateAmplitude);

    // Update tilt motion values (sprung)
    rotateX.set(rotX);
    rotateY.set(rotY);

    // Update tooltip position
    x.set(localX);
    y.set(localY);

    // Compute a simple “velocity” for tooltip rotation based on Y delta
    const velocityY = (dy * rotateAmplitude) - lastYRef.current;
    rotateFigcaption.set(-velocityY * 0.6);
    lastYRef.current = dy * rotateAmplitude;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    // Store pointer coords only (actual updates happen in rAF)
    targetRef.current.clientX = e.clientX;
    targetRef.current.clientY = e.clientY;

    // Only schedule one rAF update at a time
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(applyFromTarget);
  }

  function handlePointerEnter() {
    // Measure on enter so we have fresh bounds
    measure();

    // Animate into hovered state
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handlePointerLeave() {
    // Fade tooltip and return scale to normal
    opacity.set(0);
    scale.set(1);

    // Reset rotations to neutral
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);

    // Reset velocity tracking
    lastYRef.current = 0;

    // Cancel any pending rAF update
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  return (
    <figure
      ref={ref}
      // NOTE: perspective class removed; using transformPerspective is more Safari-friendly
      className="relative w-full h-full flex flex-col items-center justify-center"
      style={{ height: containerHeight, width: containerWidth }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Mobile warning (optional) */}
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <motion.div
        // NOTE: preserve-3d can be expensive in Safari; avoid unless necessary
        className="relative"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
          transformPerspective: 800,
          willChange: "transform",
        }}
      >
        {/* Main image */}
        <motion.img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-[15px]"
          style={{ width: imageWidth, height: imageHeight }}
          draggable={false}
        />

        {/* Optional overlay content (e.g., labels) */}
        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute top-0 left-0 z-[2]">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip near pointer (desktop only) */}
      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
