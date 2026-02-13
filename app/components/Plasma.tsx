// Plasma.tsx
import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: "forward" | "reverse" | "pingpong";
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
  qualityDownscale?: number;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 40.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;

    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }

  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export const Plasma: React.FC<PlasmaProps> = ({
  color = "#ffffff",
  speed = 1,
  direction = "forward",
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  qualityDownscale,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // container must have a real size from parent
    container.style.position = "relative";

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];
    const directionMultiplier = direction === "reverse" ? -1.0 : 1.0;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: 1, // retina-safe
    });

    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;

    // ✅ canvas visually fills container
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.display = "block";

    container.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    // ✅ pause when offscreen
    let running = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    const chooseDownscale = (w: number, h: number) => {
      if (qualityDownscale) return qualityDownscale;
      const area = w * h;
      if (area > 2_300_000) return 2.2;
      if (area > 1_500_000) return 1.9;
      if (area > 1_000_000) return 1.6;
      return 1.35;
    };

    const setSize = () => {
      rectRef.current = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rectRef.current.width));
      const h = Math.max(1, Math.floor(rectRef.current.height));
      const down = chooseDownscale(w, h);

      // ✅ internal render size reduced
      renderer.setSize(Math.max(1, Math.floor(w / down)), Math.max(1, Math.floor(h / down)));

      // ✅ but CSS size stays full (fix “small on the left”)
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteractive) return;
      if (!rectRef.current) rectRef.current = container.getBoundingClientRect();
      mouseTarget.current.x = e.clientX - rectRef.current.left;
      mouseTarget.current.y = e.clientY - rectRef.current.top;
    };

    if (mouseInteractive) {
      container.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    let raf = 0;
    const t0 = performance.now();

    const loop = (t: number) => {
      if (running) {
        const timeValue = (t - t0) * 0.001;

        if (direction === "pingpong") {
          const duration = 10;
          const seg = timeValue % duration;
          const isForward = Math.floor(timeValue / duration) % 2 === 0;
          const u = seg / duration;
          const smooth = u * u * (3.0 - 2.0 * u);
          const pingpongTime = isForward ? smooth * duration : (1.0 - smooth) * duration;
          (program.uniforms.uDirection as any).value = 1.0;
          (program.uniforms.iTime as any).value = pingpongTime;
        } else {
          (program.uniforms.iTime as any).value = timeValue;
        }

        const mu = program.uniforms.uMouse.value as Float32Array;
        mu[0] = mouseTarget.current.x;
        mu[1] = mouseTarget.current.y;

        renderer.render({ scene: mesh });
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      if (mouseInteractive) container.removeEventListener("mousemove", handleMouseMove);
      try {
        container.removeChild(canvas);
      } catch {}
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive, qualityDownscale]);

  // ✅ NOT absolute here — parent controls positioning (OriginStories wrapper is absolute inset-0)
  return <div ref={containerRef} className="w-full h-full overflow-hidden" />;
};

export default Plasma;
