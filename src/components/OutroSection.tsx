"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { X, RotateCcw, Trophy } from "lucide-react";

export default function OutroSection() {
  const [gameOpen, setGameOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pong Game State
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<"ready" | "playing" | "gameover">("ready");

  // Playable Pong Canvas Logic
  useEffect(() => {
    if (!gameOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.clientWidth || 800);
    let height = (canvas.height = canvas.clientHeight || 500);

    const paddleWidth = 14;
    const paddleHeight = 90;

    let playerY = height / 2 - paddleHeight / 2;
    let aiY = height / 2 - paddleHeight / 2;

    let ballX = width / 2;
    let ballY = height / 2;
    let ballSpeedX = 6;
    let ballSpeedY = 4;
    const ballRadius = 8;

    const trails: { x: number; y: number; alpha: number }[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      playerY = Math.max(0, Math.min(height - paddleHeight, mouseY - paddleHeight / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;
      playerY = Math.max(0, Math.min(height - paddleHeight, touchY - paddleHeight / 2));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    const resetBall = () => {
      ballX = width / 2;
      ballY = height / 2;
      ballSpeedX = -ballSpeedX;
      ballSpeedY = (Math.random() - 0.5) * 8;
    };

    const update = () => {
      // AI tracking with realistic delay
      const aiCenter = aiY + paddleHeight / 2;
      if (aiCenter < ballY - 15) {
        aiY += 4.5;
      } else if (aiCenter > ballY + 15) {
        aiY -= 4.5;
      }
      aiY = Math.max(0, Math.min(height - paddleHeight, aiY));

      // Move ball
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Ball trail
      trails.push({ x: ballX, y: ballY, alpha: 0.6 });
      if (trails.length > 12) trails.shift();

      // Top/Bottom bounces
      if (ballY - ballRadius <= 0 || ballY + ballRadius >= height) {
        ballSpeedY = -ballSpeedY;
      }

      // Player Paddle Collision (Left)
      if (
        ballX - ballRadius <= paddleWidth + 24 &&
        ballY >= playerY &&
        ballY <= playerY + paddleHeight
      ) {
        ballSpeedX = Math.abs(ballSpeedX) * 1.05;
        const deltaY = ballY - (playerY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.25;
      }

      // AI Paddle Collision (Right)
      if (
        ballX + ballRadius >= width - (paddleWidth + 24) &&
        ballY >= aiY &&
        ballY <= aiY + paddleHeight
      ) {
        ballSpeedX = -Math.abs(ballSpeedX) * 1.05;
        const deltaY = ballY - (aiY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.25;
      }

      // Score detection
      if (ballX < 0) {
        setAiScore((prev) => {
          const next = prev + 1;
          if (next >= 5) setGameStatus("gameover");
          return next;
        });
        resetBall();
      } else if (ballX > width) {
        setPlayerScore((prev) => {
          const next = prev + 1;
          if (next >= 5) setGameStatus("gameover");
          return next;
        });
        resetBall();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Court dividing dashed line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball trails
      for (const t of trails) {
        t.alpha -= 0.04;
        if (t.alpha > 0) {
          ctx.fillStyle = `rgba(41, 144, 147, ${t.alpha})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ballRadius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Ball
      ctx.fillStyle = "#ffbd00";
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Player Paddle (Left - Teal)
      ctx.fillStyle = "#299093";
      ctx.roundRect(24, playerY, paddleWidth, paddleHeight, 8);
      ctx.fill();

      // AI Paddle (Right - Terracotta)
      ctx.fillStyle = "#ef6156";
      ctx.roundRect(width - paddleWidth - 24, aiY, paddleWidth, paddleHeight, 8);
      ctx.fill();

      update();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameOpen]);

  const restartGame = () => {
    setPlayerScore(0);
    setAiScore(0);
    setGameStatus("playing");
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
      setAttractActive(true);
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
      });
      void btn.offsetWidth;
      fans.forEach((el) => {
        el.style.transition = "";
        el.style.translate = "";
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
            className="pong-ball group grid-pile max-tablet:pointer-coarse:bg-black @container mt-[9.6%] aspect-square w-[32%] cursor-pointer items-center self-start overflow-clip rounded-full bg-white will-change-transform"
            style={{ y: centerY }}
            aria-label="Play Mind Pong"
          >
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
          </motion.button>

          {/* Right Pill: Solid White */}
          <motion.span
            ref={rightRef}
            className="aspect-2/5 w-[32%] rounded-full bg-white will-change-transform"
            style={{ y: rightY }}
            aria-hidden="true"
          />
        </div>

        {/* Massive Poster Typography ("Get to know Mind") layered as z-above-content matching mindrobotics.com */}
        <motion.p
          style={{ transform: textTransform }}
          className="text-poster tablet:flex z-above-content relative pointer-events-none hidden w-full flex-col justify-center gap-[0.15em] whitespace-nowrap self-center select-none text-[#061a1e]"
        >
          <span className="even:text-right">Get to</span>
          <span className="even:text-right">know</span>
          <span className="even:text-right">Mind</span>
        </motion.p>
      </div>

      {/* Playable Pong Dialog Modal */}
      {gameOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div className="relative w-full max-w-3xl rounded-[2.5rem] bg-[#061417] border border-white/20 p-6 md:p-8 shadow-2xl flex flex-col text-white">
            {/* Header / Score Board */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#299093]" />
                  <span className="font-mono text-xs uppercase tracking-wider">You: {playerScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#ef6156]" />
                  <span className="font-mono text-xs uppercase tracking-wider">Mind AI: {aiScore}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={restartGame}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  title="Restart Game"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setGameOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  title="Close Game"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Game Canvas */}
            <div className="relative mt-6 aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
              <canvas ref={canvasRef} className="size-full cursor-none" />

              {/* Game Over Overlay */}
              {gameStatus === "gameover" && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 text-center p-6">
                  <Trophy className={`size-12 ${playerScore > aiScore ? "text-[#ffbd00]" : "text-white/40"}`} />
                  <h4 className="text-2xl md:text-3xl font-bold">
                    {playerScore > aiScore ? "Victory! Human Agility Won" : "Mind Robotics AI Won"}
                  </h4>
                  <p className="text-sm text-white/70 max-w-sm">
                    {playerScore > aiScore
                      ? "Flawless reflexes. You mastered kinematic line routing."
                      : "The foundation models learned your trajectory across production cycles."}
                  </p>
                  <button
                    type="button"
                    onClick={restartGame}
                    className="mt-2 px-6 py-2.5 rounded-full font-bold bg-[#299093] text-white hover:bg-[#207477] transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs font-mono text-center opacity-50 mt-4">
              Move your mouse or finger up and down to control the left paddle. First to 5 points wins.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
