"use client";

import React, { useEffect, useRef } from "react";

interface PatternCanvasProps {
  seed?: number;
  density?: number;
  fade?: ("top" | "bottom")[];
  className?: string;
}

// Exact cubic-bezier(0.645, 0.045, 0.355, 1) solver from module 44447 / 11339
function createCubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;

  const solveCurveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const x2 = sampleCurveX(t) - x;
      if (Math.abs(x2) < 1e-4) return t;
      const d2 = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(d2) < 1e-4) break;
      t -= x2 / d2;
    }
    return t;
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return sampleCurveY(solveCurveX(x));
  };
}

const easeInOut = createCubicBezier(0.645, 0.045, 0.355, 1);

export default function PatternCanvas({
  seed = 3,
  density = 0.5,
  fade = [],
  className = "z-behind-content absolute inset-0 size-full pointer-events-none",
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    // GLSL pseudo-random hash & value noise matching module 65578
    const hash = (e: number, t: number, i = 0) => {
      const r = 43758.5453 * Math.sin(127.1 * e + 311.7 * t + 74.7 * i);
      return r - Math.floor(r);
    };

    const smoothstep = (e: number) => e * e * (3 - 2 * e);
    const lerp = (e: number, t: number, i: number) => e + (t - e) * i;

    const noise = (e: number, t: number, i = 0) => {
      const r = Math.floor(e);
      const n = Math.floor(t);
      const s = smoothstep(e - r);
      const c = smoothstep(t - n);
      const u = lerp(hash(r, n, i), hash(r + 1, n, i), s);
      const d = lerp(hash(r, n + 1, i), hash(r + 1, n + 1, i), s);
      return lerp(u, d, c);
    };

    const getMotifType = (col: number, row: number, s: number): "circle" | "square" | "cross" => {
      if (hash(col, row, s + 200) > 0.92) return "cross";
      if (noise(col / 5, row / 5, s + 100) > 0.52) return "square";
      return "circle";
    };

    const isVisibleByDensity = (col: number, row: number, s: number, d: number) => {
      const n = 1 - d;
      const l =
        0.85 *
        Math.min(
          1,
          Math.max(
            0,
            (0.65 * noise(col / 9, row / 9, s) + 0.35 * noise(col / 3, row / 3, s + 1) - n) / (1 - n)
          ) / 0.3
        );
      return hash(col, row, s + 300) <= l;
    };

    const isFaded = (col: number, row: number, totalRows: number, s: number, f: ("top" | "bottom")[]) => {
      const hasTop = f.includes("top");
      const hasBottom = f.includes("bottom");
      const l = (Math.min(hasTop ? row : Infinity, hasBottom ? totalRows - 1 - row : Infinity) + 1) / 3;
      return l >= 1 || hash(col, row, s + 400) <= l;
    };

    interface Cell {
      type: "circle" | "square" | "cross";
      x: number;
      y: number;
      bloomStart: number;
      bloomDuration: number;
      energy: number;
    }

    let cells: (Cell | undefined)[] = [];
    let motifs: Cell[] = [];
    let columns = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    const blooming = new Set<Cell>();
    const threadTimes = [0, 0, 0];

    const SQRT2 = Math.SQRT2;
    const CROSS_G = 9.6 / SQRT2;

    const buildGrid = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      columns = Math.floor(width / 32);
      rows = Math.floor(height / 32);
      offsetX = (width - 32 * columns) / 2;
      offsetY = (height - 32 * rows) / 2;

      cells = [];
      motifs = [];
      blooming.clear();

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          if (!isFaded(c, r, rows, seed, fade)) {
            cells.push(undefined);
            continue;
          }
          const cell: Cell = {
            type: getMotifType(c, r, seed),
            x: offsetX + 32 * c + 16,
            y: offsetY + 32 * r + 16,
            bloomStart: -1,
            bloomDuration: 1,
            energy: 0,
          };
          cells.push(cell);
          if (isVisibleByDensity(c, r, seed, density)) {
            motifs.push(cell);
          }
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      buildGrid();
    });
    resizeObserver.observe(canvas);
    buildGrid();

    // Energy injection function matching module 65578: y(e, t)
    const injectEnergy = (pt: { x: number; y: number }) => {
      const s = Math.floor((pt.x - offsetX) / 32);
      const c = Math.floor((pt.y - offsetY) / 32);

      for (let t = c - 1; t <= c + 1; t++) {
        for (let l = s - 1; l <= s + 1; l++) {
          if (l < 0 || l >= columns || t < 0 || t >= rows) continue;
          const a = cells[t * columns + l];
          if (!a) continue;
          const dist = Math.hypot(a.x - pt.x, a.y - pt.y);
          const force = 1 - dist / 48;
          if (force > 0) {
            a.energy = Math.min(1, a.energy + 0.2 * force);
            blooming.add(a);
          }
        }
      }
    };

    // Fast pointer interpolation
    let lastPointer: { x: number; y: number } | null = null;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < 0 || py < 0 || px > width || py > height) {
        lastPointer = null;
        return;
      }
      const current = { x: px, y: py };
      if (!lastPointer) {
        injectEnergy(current);
      } else {
        const dx = current.x - lastPointer.x;
        const dy = current.y - lastPointer.y;
        const steps = Math.min(Math.max(1, Math.round(Math.hypot(dx, dy) / 16)), 10);
        for (let s = 1; s <= steps; s++) {
          const factor = s / steps;
          injectEnergy({
            x: lastPointer.x + dx * factor,
            y: lastPointer.y + dy * factor,
          });
        }
      }
      lastPointer = current;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("mousemove", handlePointerMove);

    const getBloomAlpha = (cell: Cell, time: number) => {
      const u = (time - cell.bloomStart) / cell.bloomDuration;
      if (u <= 0 || u >= 1) return 0;
      if (u < 0.25) return easeInOut(u / 0.25);
      if (u > 0.7) return easeInOut((1 - u) / 0.3);
      return 1;
    };

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Ambient random blooming threads (6 concurrent)
      if (motifs.length > 0) {
        threadTimes.forEach((tTime, i) => {
          if (currentTime >= tTime) {
            const root = motifs[Math.floor(Math.random() * motifs.length)];
            if (root) {
              const radius = 32 * (5 + Math.random() * 7); // 32 * [5, 12]px
              const rSq = radius * radius;
              for (const m of motifs) {
                if (blooming.has(m)) continue;
                const dx = m.x - root.x;
                const dy = m.y - root.y;
                const distSq = dx * dx + dy * dy;
                if (distSq <= rSq) {
                  m.bloomStart = currentTime + (Math.sqrt(distSq) / radius) * 600;
                  m.bloomDuration = 1700 + Math.random() * 1000; // [1700, 2700]ms
                  blooming.add(m);
                }
              }
            }
            threadTimes[i] = currentTime + 700 + Math.random() * 1300;
          }
        });
      }

      ctx.clearRect(0, 0, width, height);

      // Check current theme colors: Light mode is default Mind Robotics warm concrete
      const isLight = document.documentElement.getAttribute("data-theme") !== "dark";
      const colorCircle = isLight ? "#f6f4f0" : "rgba(255, 255, 255, 0.30)";
      const colorSquare = isLight ? "#dbd7ca" : "rgba(219, 215, 202, 0.20)";
      const colorCross = "#299093"; // Exact Mind Robotics Teal

      for (const cell of blooming) {
        cell.energy = Math.max(0, cell.energy - delta / 1000);
        const waveAlpha = getBloomAlpha(cell, currentTime);
        const totalAlpha = Math.max(waveAlpha, cell.energy);

        if (totalAlpha <= 0) {
          if (currentTime >= cell.bloomStart + cell.bloomDuration && cell.energy <= 0) {
            blooming.delete(cell);
          }
          continue;
        }

        ctx.globalAlpha = Math.min(1, totalAlpha);

        if (cell.type === "circle") {
          ctx.fillStyle = colorCircle;
          ctx.beginPath();
          ctx.arc(cell.x, cell.y, 9.6, 0, 2 * Math.PI);
          ctx.fill();
        } else if (cell.type === "square") {
          ctx.fillStyle = colorSquare;
          ctx.fillRect(cell.x - 9.6, cell.y - 9.6, 19.2, 19.2);
        } else if (cell.type === "cross") {
          ctx.strokeStyle = colorCross;
          ctx.lineWidth = 3.84;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(cell.x - CROSS_G, cell.y - CROSS_G);
          ctx.lineTo(cell.x + CROSS_G, cell.y + CROSS_G);
          ctx.moveTo(cell.x + CROSS_G, cell.y - CROSS_G);
          ctx.lineTo(cell.x - CROSS_G, cell.y + CROSS_G);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handlePointerMove);
      resizeObserver.disconnect();
    };
  }, [seed, density, fade]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
