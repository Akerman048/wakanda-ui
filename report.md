# Front-End Trial Task Report

## Live Demo
https://your-vercel-link.vercel.app

## Video Walkthrough
https://drive.google.com/your-video

---

## Project Goal

Recreate a cinematic, scroll-driven web experience inspired by the reference website while replacing the original heavy 3D implementation with performant front-end techniques.

The focus was on building an immersive UI while maintaining smooth performance and clean architecture.

---

## What I Built

### Hero Section
- Fullscreen video background
- Mouse-based parallax
- Cinematic gradient transitions between sections

### OriginStories Section
- WebGL Plasma background replacing complex 3D
- Mouse-driven parallax
- Scroll-triggered card reveals
- Layered lighting and vignette effects

### VideoBlock Section
- Scroll-driven video scaling from micro to fullscreen
- Seamless top/bottom fades for cinematic continuity

---

## Key Technical Decisions

### Replacing 3D with WebGL Shader
Instead of using heavy 3D models, I implemented a shader-based Plasma effect to achieve a similar immersive feel with significantly better performance.

### Animation Architecture
To prevent transform conflicts:

- **GSAP ScrollTrigger** handles scroll-based animations  
- **Motion** is isolated to interactive components (TiltedCard)

This separation keeps animations predictable and avoids layout thrashing.

### Performance Optimization
- Downscaled WebGL render resolution dynamically
- Paused rendering when offscreen using IntersectionObserver
- Throttled mouse movement with requestAnimationFrame
- Minimized layout recalculations

### UX Considerations
- Cinematic transitions between sections
- Reduced visual noise to guide user focus
- Maintained smooth interaction even on high-resolution displays

---

## Tech Stack

- React
- GSAP + ScrollTrigger
- Motion
- OGL (WebGL)
- Vercel

---

## What I Would Improve With More Time

- Add `prefers-reduced-motion` fallback
- Further optimize shader performance for low-end GPUs
- Improve mobile experience with adaptive effects
- Extract animation hooks for better scalability

---

## AI Usage Disclosure

This project was developed iteratively using AI as a pair-programming assistant.

I designed the architecture, user experience, animation flow, and component integration while leveraging AI to accelerate implementation, explore approaches, and refine performance.

AI was used as a productivity tool — similar to modern industry workflows — while maintaining full understanding and ownership of the technical decisions.
