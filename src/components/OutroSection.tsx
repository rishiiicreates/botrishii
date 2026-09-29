"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { X, RotateCcw, Trophy } from "lucide-react";

export default function OutroSection() {
  const [gameOpen, setGameOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Game Mode
  type GameMode = "breakout" | "pong" | "snake";
  const [activeGame, setActiveGame] = useState<GameMode>("breakout");
  const [gameStatus, setGameStatus] = useState<"ready" | "playing" | "gameover" | "victory">("playing");
  const [resetTrigger, setResetTrigger] = useState(0);

  // Pong State
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);

  // Breakout State
  const [breakoutScore, setBreakoutScore] = useState(0);
  const [breakoutLives, setBreakoutLives] = useState(3);
  const [breakoutBricksLeft, setBreakoutBricksLeft] = useState(32);

  // Snake State
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeLength, setSnakeLength] = useState(3);

  // Playable Games Canvas Engine
  useEffect(() => {
    if (!gameOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const clientW = canvas.clientWidth || 800;
    const clientH = canvas.clientHeight || 480;
    canvas.width = Math.floor(clientW * dpr);
    canvas.height = Math.floor(clientH * dpr);
    ctx.scale(dpr, dpr);

    const width = clientW;
    const height = clientH;

    // Common Particle Pool for sparks & collisions
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      size: number;
    }[] = [];

    const spawnParticles = (x: number, y: number, color: string, count = 8) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1,
          size: 2 + Math.random() * 2.5,
        });
      }
    };

    // ==========================================
    // 1. BUG BREAKOUT ENGINE
    // ==========================================
    const paddleW = 110;
    const paddleH = 14;
    let bPaddleX = width / 2 - paddleW / 2;
    let bBallX = width / 2;
    let bBallY = height - 60;
    let bBallVx = 4.5 * (Math.random() > 0.5 ? 1 : -1);
    let bBallVy = -5.5;
    const bBallRadius = 7;
    const bTrails: { x: number; y: number; alpha: number }[] = [];

    interface Brick {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      points: number;
      alive: boolean;
    }

    const brickCols = 8;
    const brickRows = 4;
    const brickPadding = 8;
    const brickOffsetTop = 40;
    const brickOffsetLeft = 24;
    const brickW = (width - brickOffsetLeft * 2 - (brickCols - 1) * brickPadding) / brickCols;
    const brickH = 20;

    const rowColors = ["#ef6156", "#ffbd00", "#299093", "#f6f4f0"];
    const rowPoints = [40, 30, 20, 10];
    const bricks: Brick[] = [];

    for (let r = 0; r < brickRows; r++) {
      for (let c = 0; c < brickCols; c++) {
        bricks.push({
          x: brickOffsetLeft + c * (brickW + brickPadding),
          y: brickOffsetTop + r * (brickH + brickPadding),
          w: brickW,
          h: brickH,
          color: rowColors[r % rowColors.length],
          points: rowPoints[r % rowPoints.length],
          alive: true,
        });
      }
    }

    // ==========================================
    // 2. AGENT PONG ENGINE
    // ==========================================
    const pPaddleW = 14;
    const pPaddleH = 88;
    let pPlayerY = height / 2 - pPaddleH / 2;
    let pAiY = height / 2 - pPaddleH / 2;
    let pBallX = width / 2;
    let pBallY = height / 2;
    let pBallVx = 6 * (Math.random() > 0.5 ? 1 : -1);
    let pBallVy = (Math.random() - 0.5) * 6;
    const pBallRadius = 8;
    const pTrails: { x: number; y: number; alpha: number }[] = [];

    // ==========================================
    // 3. PIPELINE SNAKE ENGINE
    // ==========================================
    const gridSize = 20;
    const sCols = Math.floor(width / gridSize);
    const sRows = Math.floor(height / gridSize);
    const snake = [
      { x: Math.floor(sCols / 2), y: Math.floor(sRows / 2) },
      { x: Math.floor(sCols / 2) - 1, y: Math.floor(sRows / 2) },
      { x: Math.floor(sCols / 2) - 2, y: Math.floor(sRows / 2) },
    ];
    let sDir = { x: 1, y: 0 };
    let sNextDir = { x: 1, y: 0 };
    const foodTypes = [
      { color: "#ef6156", points: 10, label: "SENSOR" },
      { color: "#ffbd00", points: 25, label: "ACTUATOR" },
      { color: "#299093", points: 50, label: "NEURAL CORE" },
    ];
    let sFood = {
      x: Math.floor(Math.random() * sCols),
      y: Math.floor(Math.random() * sRows),
      type: foodTypes[0],
    };
    let sLastTick = 0;
    const sTickRate = 100; // ms per step

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (activeGame === "breakout") {
        bPaddleX = Math.max(0, Math.min(width - paddleW, mouseX - paddleW / 2));
      } else if (activeGame === "pong") {
        pPlayerY = Math.max(0, Math.min(height - pPaddleH, mouseY - pPaddleH / 2));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const touchY = e.touches[0].clientY - rect.top;

      if (activeGame === "breakout") {
        bPaddleX = Math.max(0, Math.min(width - paddleW, touchX - paddleW / 2));
      } else if (activeGame === "pong") {
        pPlayerY = Math.max(0, Math.min(height - pPaddleH, touchY - pPaddleH / 2));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGame === "breakout") {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          bPaddleX = Math.max(0, bPaddleX - 35);
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          bPaddleX = Math.min(width - paddleW, bPaddleX + 35);
        }
      } else if (activeGame === "snake") {
        if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && sDir.y === 0) {
          sNextDir = { x: 0, y: -1 };
        } else if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && sDir.y === 0) {
          sNextDir = { x: 0, y: 1 };
        } else if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && sDir.x === 0) {
          sNextDir = { x: -1, y: 0 };
        } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && sDir.x === 0) {
          sNextDir = { x: 1, y: 0 };
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    // Main Animation Loop
    const loop = (currentTime: number) => {
      ctx.clearRect(0, 0, width, height);

      // Draw Background Matrix Grid
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let x = 16; x < width; x += 32) {
        for (let y = 16; y < height; y += 32) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update & Render Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // subtle gravity
        p.alpha -= 0.025;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ----------------------------------------------------
      // MODE A: ROBO BREAKOUT
      // ----------------------------------------------------
      if (activeGame === "breakout") {
        // Move Ball
        bBallX += bBallVx;
        bBallY += bBallVy;

        // Ball Trail
        bTrails.push({ x: bBallX, y: bBallY, alpha: 0.6 });
        if (bTrails.length > 8) bTrails.shift();

        // Wall collisions
        if (bBallX - bBallRadius <= 0) {
          bBallX = bBallRadius;
          bBallVx = -bBallVx;
          spawnParticles(bBallX, bBallY, "#ffbd00", 4);
        } else if (bBallX + bBallRadius >= width) {
          bBallX = width - bBallRadius;
          bBallVx = -bBallVx;
          spawnParticles(bBallX, bBallY, "#ffbd00", 4);
        }

        if (bBallY - bBallRadius <= 0) {
          bBallY = bBallRadius;
          bBallVy = -bBallVy;
          spawnParticles(bBallX, bBallY, "#ffbd00", 4);
        }

        // Paddle Collision
        const paddleY = height - 32;
        if (
          bBallY + bBallRadius >= paddleY &&
          bBallY - bBallRadius <= paddleY + paddleH &&
          bBallX >= bPaddleX - 4 &&
          bBallX <= bPaddleX + paddleW + 4
        ) {
          bBallVy = -Math.abs(bBallVy);
          const hitOffset = (bBallX - (bPaddleX + paddleW / 2)) / (paddleW / 2);
          bBallVx = hitOffset * 7;
          spawnParticles(bBallX, paddleY, "#299093", 6);
        }

        // Brick Collisions
        let remaining = 0;
        for (const brick of bricks) {
          if (!brick.alive) continue;
          remaining++;

          if (
            bBallX + bBallRadius >= brick.x &&
            bBallX - bBallRadius <= brick.x + brick.w &&
            bBallY + bBallRadius >= brick.y &&
            bBallY - bBallRadius <= brick.y + brick.h
          ) {
            brick.alive = false;
            bBallVy = -bBallVy;
            spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color, 12);
            setBreakoutScore((s) => s + brick.points);
            remaining--;
            break;
          }
        }
        setBreakoutBricksLeft(remaining);

        if (remaining === 0) {
          setGameStatus("victory");
        }

        // Bottom Fall / Loss of life
        if (bBallY - bBallRadius > height) {
          setBreakoutLives((lives) => {
            const next = lives - 1;
            if (next <= 0) {
              setGameStatus("gameover");
            } else {
              bBallX = bPaddleX + paddleW / 2;
              bBallY = height - 60;
              bBallVx = 4.5 * (Math.random() > 0.5 ? 1 : -1);
              bBallVy = -5.5;
            }
            return next;
          });
        }

        // Render Bricks
        for (const brick of bricks) {
          if (!brick.alive) continue;
          ctx.fillStyle = brick.color;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 6);
          ctx.fill();

          // Subtle inner gloss
          ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
          ctx.beginPath();
          ctx.roundRect(brick.x + 2, brick.y + 2, brick.w - 4, 3, 2);
          ctx.fill();
        }

        // Render Ball Trails
        for (const t of bTrails) {
          t.alpha -= 0.06;
          if (t.alpha > 0) {
            ctx.fillStyle = `rgba(255, 189, 0, ${t.alpha})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, bBallRadius * 0.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Render Ball
        ctx.fillStyle = "#ffbd00";
        ctx.beginPath();
        ctx.arc(bBallX, bBallY, bBallRadius, 0, Math.PI * 2);
        ctx.fill();

        // Render Paddle (Styled as Pill Tag)
        ctx.fillStyle = "#299093";
        ctx.beginPath();
        ctx.roundRect(bPaddleX, paddleY, paddleW, paddleH, 8);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Accent dots on paddle
        ctx.fillStyle = "#ef6156";
        ctx.beginPath();
        ctx.arc(bPaddleX + 10, paddleY + paddleH / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffbd00";
        ctx.beginPath();
        ctx.arc(bPaddleX + paddleW - 10, paddleY + paddleH / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ----------------------------------------------------
      // MODE B: AGENT PONG
      // ----------------------------------------------------
      else if (activeGame === "pong") {
        // AI tracking
        const aiCenter = pAiY + pPaddleH / 2;
        if (aiCenter < pBallY - 14) pAiY += 4.4;
        else if (aiCenter > pBallY + 14) pAiY -= 4.4;
        pAiY = Math.max(0, Math.min(height - pPaddleH, pAiY));

        // Move Ball
        pBallX += pBallVx;
        pBallY += pBallVy;

        pTrails.push({ x: pBallX, y: pBallY, alpha: 0.6 });
        if (pTrails.length > 10) pTrails.shift();

        if (pBallY - pBallRadius <= 0 || pBallY + pBallRadius >= height) {
          pBallVy = -pBallVy;
        }

        // Left Player Paddle Collision
        if (
          pBallX - pBallRadius <= pPaddleW + 24 &&
          pBallY >= pPlayerY &&
          pBallY <= pPlayerY + pPaddleH
        ) {
          pBallVx = Math.abs(pBallVx) * 1.05;
          const deltaY = pBallY - (pPlayerY + pPaddleH / 2);
          pBallVy = deltaY * 0.25;
          spawnParticles(pPaddleW + 24, pBallY, "#299093", 6);
        }

        // Right AI Paddle Collision
        if (
          pBallX + pBallRadius >= width - (pPaddleW + 24) &&
          pBallY >= pAiY &&
          pBallY <= pAiY + pPaddleH
        ) {
          pBallVx = -Math.abs(pBallVx) * 1.05;
          const deltaY = pBallY - (pAiY + pPaddleH / 2);
          pBallVy = deltaY * 0.25;
          spawnParticles(width - pPaddleW - 24, pBallY, "#ef6156", 6);
        }

        // Scoring
        if (pBallX < 0) {
          setAiScore((s) => {
            const next = s + 1;
            if (next >= 5) setGameStatus("gameover");
            return next;
          });
          pBallX = width / 2;
          pBallY = height / 2;
          pBallVx = 6;
          pBallVy = (Math.random() - 0.5) * 6;
        } else if (pBallX > width) {
          setPlayerScore((s) => {
            const next = s + 1;
            if (next >= 5) setGameStatus("victory");
            return next;
          });
          pBallX = width / 2;
          pBallY = height / 2;
          pBallVx = -6;
          pBallVy = (Math.random() - 0.5) * 6;
        }

        // Dashed center court divider
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Trails
        for (const t of pTrails) {
          t.alpha -= 0.05;
          if (t.alpha > 0) {
            ctx.fillStyle = `rgba(41, 144, 147, ${t.alpha})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, pBallRadius * 0.75, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Ball
        ctx.fillStyle = "#ffbd00";
        ctx.beginPath();
        ctx.arc(pBallX, pBallY, pBallRadius, 0, Math.PI * 2);
        ctx.fill();

        // Left Player Paddle
        ctx.fillStyle = "#299093";
        ctx.beginPath();
        ctx.roundRect(24, pPlayerY, pPaddleW, pPaddleH, 8);
        ctx.fill();

        // Right AI Paddle
        ctx.fillStyle = "#ef6156";
        ctx.beginPath();
        ctx.roundRect(width - pPaddleW - 24, pAiY, pPaddleW, pPaddleH, 8);
        ctx.fill();
      }

      // ----------------------------------------------------
      // MODE C: PIPELINE SNAKE
      // ----------------------------------------------------
      else if (activeGame === "snake") {
        if (currentTime - sLastTick > sTickRate) {
          sLastTick = currentTime;
          sDir = sNextDir;

          const head = { x: snake[0].x + sDir.x, y: snake[0].y + sDir.y };

          // Wall wrapping
          if (head.x < 0) head.x = sCols - 1;
          else if (head.x >= sCols) head.x = 0;
          if (head.y < 0) head.y = sRows - 1;
          else if (head.y >= sRows) head.y = 0;

          // Self collision
          if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
            setGameStatus("gameover");
          } else {
            snake.unshift(head);

            // Food collision
            if (head.x === sFood.x && head.y === sFood.y) {
              spawnParticles(
                sFood.x * gridSize + gridSize / 2,
                sFood.y * gridSize + gridSize / 2,
                sFood.type.color,
                12
              );
              setSnakeScore((s) => s + sFood.type.points);
              setSnakeLength(snake.length);
              const randType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
              sFood = {
                x: Math.floor(Math.random() * sCols),
                y: Math.floor(Math.random() * sRows),
                type: randType,
              };
            } else {
              snake.pop();
            }
          }
        }

        // Render Food Component Chip
        const fx = sFood.x * gridSize + 2;
        const fy = sFood.y * gridSize + 2;
        const fw = gridSize - 4;
        ctx.fillStyle = sFood.type.color;
        ctx.beginPath();
        ctx.roundRect(fx, fy, fw, fw, 5);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(fx + fw / 2, fy + fw / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Render Snake Circuit Body
        snake.forEach((seg, idx) => {
          const sx = seg.x * gridSize + 2;
          const sy = seg.y * gridSize + 2;
          const sw = gridSize - 4;

          if (idx === 0) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(sx, sy, sw, sw, 6);
            ctx.fill();

            // Head Sensor Eyes
            ctx.fillStyle = "#299093";
            ctx.beginPath();
            ctx.arc(sx + sw / 2, sy + sw / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = idx % 2 === 0 ? "#299093" : "#247f82";
            ctx.beginPath();
            ctx.roundRect(sx, sy, sw, sw, 4);
            ctx.fill();
          }
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOpen, activeGame, resetTrigger]);

  const restartCurrentGame = () => {
    setPlayerScore(0);
    setAiScore(0);
    setBreakoutScore(0);
    setBreakoutLives(3);
    setSnakeScore(0);
    setSnakeLength(3);
    setGameStatus("playing");
    setResetTrigger((prev) => prev + 1);
  };

  const sectionRef = useRef<HTMLElement | null>(null);
  const ballRef = useRef<HTMLButtonElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const leftRef = useRef<HTMLSpanElement | null>(null);
  const rightRef = useRef<HTMLSpanElement | null>(null);

  // Scroll Progress across section: offset ["start end", "end end"]
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  // Second half of scroll progress maps to 0 -> 1 (matching live site module 40937)
  const C = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const textTransform = useTransform(C, (v) => `translateY(${-105 * v}%)`);
  const leftY = useTransform(C, [0, 1], ["20%", "0%"]);
  const centerY = useTransform(C, [0, 1], ["50%", "0%"]);
  const rightY = useTransform(C, [0, 1], ["40%", "0%"]);

  // Attract cycle when user scrolls to bottom of section
  const [attractActive, setAttractActive] = useState(false);

  useMotionValueEvent(C, "change", (latest) => {
    if (typeof window === "undefined") return;
    const isFine = window.matchMedia("(pointer: fine)").matches;
    const prefersMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAttractActive(isFine && prefersMotion && latest >= 1);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFine = window.matchMedia("(pointer: fine)").matches;
    const prefersMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isFine && prefersMotion && C.get() >= 1) {
      queueMicrotask(() => {
        setAttractActive(true);
      });
    }
  }, [C]);

  useEffect(() => {
    const btn = ballRef.current;
    const txt = textRef.current;
    if (!attractActive || !btn || !txt || gameOpen) return;

    let isHovered = false;
    let timerN = 0;
    let timerA = 0;
    let timerI = 0;

    const resetFans = () => {
      const fans = Array.from(btn.querySelectorAll<HTMLElement>(".reveal-fan"));
      fans.forEach((el) => {
        el.style.transition = "none";
        el.style.translate = "-102% 0";
        el.style.transform = "translateX(-102%)";
      });
      void btn.offsetWidth;
      fans.forEach((el) => {
        el.style.transition = "";
        el.style.translate = "";
        el.style.transform = "";
      });
    };

    const clearTimers = () => {
      window.clearTimeout(timerN);
      window.clearTimeout(timerA);
      window.clearTimeout(timerI);
    };

    const attract = () => {
      if (isHovered || btn.matches(":hover")) return;
      btn.classList.add("attract-in");
      timerA = window.setTimeout(() => {
        if (isHovered || btn.matches(":hover")) return;
        btn.classList.remove("attract-in");
        btn.classList.add("attract-out");
        timerI = window.setTimeout(() => {
          resetFans();
          scheduleAttract(1700);
        }, 900);
      }, 2900);
    };

    const scheduleAttract = (delay: number) => {
      window.clearTimeout(timerN);
      timerN = window.setTimeout(attract, delay);
    };

    const handleMouseEnter = () => {
      isHovered = true;
      clearTimers();
      btn.classList.remove("attract-in", "attract-out");
      resetFans();
    };

    const handleMouseLeave = () => {
      txt.style.translate = "";
      isHovered = false;
      btn.classList.remove("attract-in", "attract-out");
      scheduleAttract(2100);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) {
        isHovered = true;
        clearTimers();
        btn.classList.remove("attract-in", "attract-out");
      }
      const rect = btn.getBoundingClientRect();
      let x = e.clientX - (rect.left + rect.width / 2);
      let y = e.clientY - (rect.top + rect.height / 2);
      const maxDist = 0.13 * rect.width;
      const dist = Math.hypot(x, y);
      if (dist > maxDist) {
        x = (x / dist) * maxDist;
        y = (y / dist) * maxDist;
      }
      txt.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    };

    btn.addEventListener("mouseenter", handleMouseEnter);
    btn.addEventListener("mouseleave", handleMouseLeave);
    btn.addEventListener("mousemove", handleMouseMove, { passive: true });

    resetFans();
    scheduleAttract(1700);

    return () => {
      clearTimers();
      resetFans();
      btn.classList.remove("attract-in", "attract-out");
      btn.removeEventListener("mouseenter", handleMouseEnter);
      btn.removeEventListener("mouseleave", handleMouseLeave);
      btn.removeEventListener("mousemove", handleMouseMove);
    };
  }, [attractActive, gameOpen]);

  const handlePlayClick = () => {
    const el = sectionRef.current;
    if (el) {
      const { top, height } = el.getBoundingClientRect();
      const offset = top + height - window.innerHeight;
      if (Math.abs(offset) > 2) {
        window.scrollBy({ top: offset, behavior: "smooth" });
      }
    }
    setGameOpen(true);
    setGameStatus("playing");
  };

  return (
    <section ref={sectionRef} className="tablet:h-[200svh] relative min-h-[160vh]">
      <div className="grid-pile px-gutter-outer tablet:sticky tablet:top-0 tablet:h-svh tablet:grid-rows-[minmax(0,1fr)] tablet:py-6 desktop:py-14 py-10 overflow-hidden">
        {/* Center Silhouette Geometry & Interactive Pong Ball layered in the center */}
        <div className="flex justify-between w-columns-5/4 tablet:w-columns-10/9 desktop:w-columns-9/8 tablet:max-w-[calc((100svh-4.8rem)*5/4)] desktop:max-w-[calc((100svh-11.2rem)*5/4)] self-center justify-self-center relative z-0">
          {/* Left Pill: Solid White */}
          <motion.span
            ref={leftRef}
            className="aspect-2/5 w-[32%] rounded-full bg-white will-change-transform"
            style={{ y: leftY }}
            aria-hidden="true"
          />

          {/* Center Interactive Pong Ball Button */}
          <motion.button
            ref={ballRef}
            type="button"
            onClick={handlePlayClick}
            className="pong-ball group grid-pile max-tablet:pointer-coarse:bg-black @container mt-[9.6%] aspect-square w-[32%] cursor-pointer items-center self-start overflow-hidden rounded-full bg-white [clip-path:circle(50%_at_50%_50%)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] [transform:translateZ(0)] isolate will-change-transform"
            style={{ y: centerY }}
            aria-label="Play Agent Pong"
          >
            {/* Inner clipping container for 100% WebKit/Safari boundary compliance */}
            <div className="size-full rounded-full overflow-hidden [clip-path:circle(50%_at_50%_50%)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] [transform:translateZ(0)] grid-pile items-center pointer-events-none">
              {/* 4-Layer Radial Fan Hover Wipe */}
              <span className="reveal-fan max-tablet:pointer-coarse:hidden pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#299093] delay-0" aria-hidden="true" />
              <span className="reveal-fan max-tablet:pointer-coarse:hidden pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#ef6156] delay-50" aria-hidden="true" />
              <span className="reveal-fan max-tablet:pointer-coarse:hidden pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#ffbd00] delay-100" aria-hidden="true" />
              <span className="reveal-fan max-tablet:pointer-coarse:hidden pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#061a1e] delay-180" aria-hidden="true" />

              <span
                ref={textRef}
                className="pong-play max-tablet:pointer-coarse:opacity-100 relative justify-self-center text-[25cqw] leading-none font-bold tracking-[-0.02em] text-white opacity-0 transition-opacity delay-300 duration-200 group-hover:opacity-100 motion-reduce:transition-none"
              >
                Play
              </span>
            </div>
          </motion.button>

          {/* Right Pill: Solid White */}
          <motion.span
            ref={rightRef}
            className="aspect-2/5 w-[32%] rounded-full bg-white will-change-transform"
            style={{ y: rightY }}
            aria-hidden="true"
          />
        </div>

        {/* Massive Poster Typography ("Get to know Rishii") layered as z-above-content */}
        <motion.p
          style={{ transform: textTransform }}
          className="text-poster tablet:flex z-above-content relative pointer-events-none hidden w-full flex-col justify-center gap-[0.15em] whitespace-nowrap self-center select-none text-[#061a1e]"
        >
          <span className="even:text-right">Get to</span>
          <span className="even:text-right">know</span>
          <span className="even:text-right">Rishii</span>
        </motion.p>
      </div>

      {/* Playable Multi-Game Dialog Modal */}
      {gameOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div className="relative w-full max-w-4xl rounded-[2.8rem] bg-[#061417] border border-white/20 p-6 md:p-8 shadow-2xl flex flex-col text-white">
            {/* Header / Game Selector & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
              {/* Game Selector Tabs (Pill Tag Design) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGame("breakout");
                      setGameStatus("playing");
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                      activeGame === "breakout"
                        ? "bg-[#ef6156] text-[#061a1e] font-bold shadow-md"
                        : "border border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Bug Breakout
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGame("pong");
                      setGameStatus("playing");
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                      activeGame === "pong"
                        ? "bg-[#299093] text-white font-bold shadow-md"
                        : "border border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Agent Pong
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGame("snake");
                      setGameStatus("playing");
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                      activeGame === "snake"
                        ? "bg-[#ffbd00] text-[#061a1e] font-bold shadow-md"
                        : "border border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Pipeline Snake
                  </button>
                </div>
                <p className="text-[11px] font-mono text-white/50 tracking-wider">
                  Built between deploys. High scores are purely anecdotal.
                </p>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={restartCurrentGame}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Restart Current Game"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setGameOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Close Game"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Telemetry HUD Bar */}
            <div className="flex items-center justify-between pt-4 pb-2 font-mono text-xs uppercase tracking-wider text-white/80">
              {activeGame === "breakout" && (
                <>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#ef6156]" />
                      <span>SCORE: {breakoutScore}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#ffbd00]" />
                      <span>BUGS LEFT: {breakoutBricksLeft}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-60 mr-1">LIVES:</span>
                    {[...Array(3)].map((_, i) => (
                      <span
                        key={i}
                        className={`size-2.5 rounded-full transition-all duration-300 ${
                          i < breakoutLives ? "bg-[#299093] shadow-[0_0_8px_#299093]" : "bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {activeGame === "pong" && (
                <>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#299093]" />
                      <span>YOU: {playerScore}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#ef6156]" />
                      <span>MY AGENT: {aiScore}</span>
                    </span>
                  </div>
                  <span className="text-white/50">FIRST TO 5 POINTS</span>
                </>
              )}

              {activeGame === "snake" && (
                <>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#ffbd00]" />
                      <span>SCORE: {snakeScore}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-[#299093]" />
                      <span>PIPELINE LENGTH: {snakeLength}</span>
                    </span>
                  </div>
                  <span className="text-white/50">COLLECT DATA PACKETS</span>
                </>
              )}
            </div>

            {/* Game Canvas */}
            <div className="relative mt-3 aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#040d0f] border border-white/10 flex items-center justify-center shadow-inner">
              <canvas ref={canvasRef} className="size-full cursor-crosshair" />

              {/* Game Over / Victory Overlay */}
              {(gameStatus === "gameover" || gameStatus === "victory") && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center p-6 animate-in fade-in duration-200">
                  <Trophy
                    className={`size-12 ${
                      gameStatus === "victory" ? "text-[#ffbd00]" : "text-white/30"
                    }`}
                  />
                  <h4 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {gameStatus === "victory"
                      ? "Deployed Successfully!"
                      : "Build Failed"}
                  </h4>
                  <p className="text-sm text-white/70 max-w-md">
                    {gameStatus === "victory"
                      ? activeGame === "breakout"
                        ? "Clean deploy. All 32 bugs squashed before production."
                        : activeGame === "pong"
                        ? "Human instinct beats the automation agent."
                        : "Pipeline fully routed with zero dropped packets."
                      : activeGame === "breakout"
                      ? "Too many bugs slipped through. Patch it up and try again."
                      : activeGame === "pong"
                      ? "The agent learned your moves across every rally. Retrain and go again."
                      : "Pipeline collided with itself. Check the logs and retry."}
                  </p>
                  <button
                    type="button"
                    onClick={restartCurrentGame}
                    className="mt-3 px-8 py-3 rounded-full font-bold bg-[#299093] text-white hover:bg-[#207477] transition-all hover:scale-105 cursor-pointer shadow-lg"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Control Instructions */}
            <p className="text-xs font-mono text-center text-white/40 mt-4 tracking-wider">
              {activeGame === "breakout" && "Move mouse horizontally to control the paddle"}
              {activeGame === "pong" && "Move mouse vertically to control left paddle • First to 5 points"}
              {activeGame === "snake" && "Use Arrow keys or WASD to steer the pipeline"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
