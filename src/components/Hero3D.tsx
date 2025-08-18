
import React, { useRef, useEffect } from 'react';

const Hero3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = rect.width;
      const cssH = rect.height;
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      // Scale drawing operations so we can use CSS pixels in code
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
    };

    resize();
    window.addEventListener('resize', resize);

    type BlobSpec = {
      x: number; // 0-1 normalized
      y: number; // 0-1 normalized
      r: number; // radius in px (CSS pixels)
      hue: number; // teal-adjacent hue to stay on brand
      speed: number;
      amp: number; // amplitude as fraction of width/height
      phase: number;
    };

    // Professional, subtle animated gradient blobs (teal family)
    const blobs: BlobSpec[] = [
      { x: 0.2, y: 0.3, r: 180, hue: 172, speed: 0.30, amp: 0.04, phase: 0 },
      { x: 0.8, y: 0.2, r: 160, hue: 168, speed: 0.25, amp: 0.05, phase: Math.PI / 3 },
      { x: 0.7, y: 0.75, r: 200, hue: 176, speed: 0.20, amp: 0.03, phase: Math.PI / 1.5 },
    ];

    let t = 0;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Subtle center glow that respects brand color
      const backgroundGlow = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.6
      );
      backgroundGlow.addColorStop(0, 'rgba(78, 205, 196, 0.10)');
      backgroundGlow.addColorStop(1, 'rgba(78, 205, 196, 0.02)');
      ctx.fillStyle = backgroundGlow;
      ctx.fillRect(0, 0, w, h);

      // Soft additive blending for modern gradient mesh vibe
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const bx = (b.x + Math.sin(t * b.speed + b.phase) * b.amp) * w;
        const by = (b.y + Math.cos(t * b.speed * 0.9 + b.phase) * b.amp) * h;
        const radius = b.r * (0.9 + 0.1 * Math.sin(t * b.speed + i));

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        // Teal family, matching existing brand color (#4ecdc4 ~ 172deg)
        grad.addColorStop(0, `hsla(${b.hue}, 70%, 55%, 0.30)`);
        grad.addColorStop(1, `hsla(${b.hue}, 70%, 55%, 0.00)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset blend mode
      ctx.globalCompositeOperation = 'source-over';

      t += 0.005; // Slow, refined motion
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-70"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};

export default Hero3D;
