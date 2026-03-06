"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

/*
 * Camera-Lens HUD Loading Screen
 * ───────────────────────────────
 * Inspired by anime.js hero animation.
 * Features concentric rotating rings, tick marks, dot trails,
 * a morphing central core, lens flare, and a transition to
 * the IMPACT HEROS logo reveal.
 *
 * Phase 1 (0–3.5s):  Camera lens HUD animation plays
 * Phase 2 (3.5–5.0s): HUD collapses inward → IMPACT HEROS logo reveals
 * Phase 3 (5.0s+):    Fade to dashboard
 */

// ─── SVG Camera Lens Component ─────────────────────────────────
function CameraLens() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const t = timeRef.current;
    const r = Math.min(cx, cy) * 0.85;

    ctx.clearRect(0, 0, w, h);

    // ── Outer colored ring arcs ──
    const arcColors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"];
    const arcGaps = 0.08;
    const arcLen = Math.PI / 2 - arcGaps;
    ctx.lineWidth = 4;
    arcColors.forEach((color, i) => {
      const startAngle = i * (Math.PI / 2) + t * 0.3 + arcGaps / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + arcLen);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // ── Second ring (thinner, offset rotation) ──
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
    ctx.stroke();

    // ── Tick marks ring (camera focus ring) ──
    const tickCount = 72;
    const tickR = r * 0.88;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2 + t * -0.5;
      const isMajor = i % 6 === 0;
      const innerR = tickR - (isMajor ? 12 : 6);
      const outerR = tickR;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.strokeStyle = isMajor
        ? "rgba(255,255,255,0.5)"
        : "rgba(255,255,255,0.15)";
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    // ── Inner dark circle ──
    const innerR = r * 0.75;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    grad.addColorStop(0, "rgba(10,10,10,1)");
    grad.addColorStop(0.8, "rgba(15,18,25,0.95)");
    grad.addColorStop(1, "rgba(20,25,35,0.8)");
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // ── Central morphing shape (scan-line filled diamond/blob) ──
    const morphPhase = Math.sin(t * 0.8) * 0.5 + 0.5;
    const shapeR = innerR * (0.3 + morphPhase * 0.35);
    const points = 120;

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      // Diamond-to-star morph
      const distort =
        1 +
        Math.sin(angle * 2 + t) * 0.3 * morphPhase +
        Math.sin(angle * 4 - t * 1.5) * 0.15 * (1 - morphPhase);
      const px = cx + Math.cos(angle) * shapeR * distort;
      const py = cy + Math.sin(angle) * shapeR * distort;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.clip();

    // Fill with scan lines
    ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
    ctx.fillRect(cx - shapeR * 1.5, cy - shapeR * 1.5, shapeR * 3, shapeR * 3);
    const lineSpacing = 4;
    ctx.strokeStyle = "rgba(239, 68, 68, 0.45)";
    ctx.lineWidth = 1.5;
    for (
      let y = cy - shapeR * 1.5;
      y < cy + shapeR * 1.5;
      y += lineSpacing
    ) {
      ctx.beginPath();
      ctx.moveTo(cx - shapeR * 1.5, y);
      ctx.lineTo(cx + shapeR * 1.5, y);
      ctx.stroke();
    }
    ctx.restore();

    // ── Dot wave trails ──
    const dotCount = 20;
    for (let trail = 0; trail < 3; trail++) {
      const trailAngle = (trail / 3) * Math.PI * 2 + t * 0.4;
      for (let i = 0; i < dotCount; i++) {
        const progress = i / dotCount;
        const waveR =
          innerR * (0.3 + progress * 0.6) +
          Math.sin(progress * Math.PI * 3 + t * 2 + trail) * 15;
        const angle = trailAngle + progress * 1.2;
        const dotX = cx + Math.cos(angle) * waveR;
        const dotY = cy + Math.sin(angle) * waveR;
        const dotSize = 2.5 * (1 - progress * 0.5);

        ctx.beginPath();
        ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.7 - progress * 0.5})`;
        ctx.fill();
      }
    }

    // ── Emerald accent ring (brand color) ──
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, t * -0.8, t * -0.8 + Math.PI * 1.2);
    ctx.stroke();

    // ── Lens flare / glare arc ──
    const flareAngle = t * 0.6;
    const flareStartAngle = flareAngle;
    const flareEndAngle = flareAngle + 0.8;
    const flareGrad = ctx.createConicGradient(flareStartAngle, cx, cy);
    flareGrad.addColorStop(0, "rgba(255,255,255,0)");
    flareGrad.addColorStop(0.05, "rgba(255,255,255,0.12)");
    flareGrad.addColorStop(0.1, "rgba(255,255,255,0.06)");
    flareGrad.addColorStop(0.15, "rgba(255,255,255,0)");
    flareGrad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.lineWidth = 20;
    ctx.strokeStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.83, flareStartAngle, flareEndAngle);
    ctx.stroke();

    // ── Inner detail ring ──
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, t * 1.2, t * 1.2 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Tiny data points rotating ──
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + t * 0.9;
      const dotR = r * 0.48;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * dotR,
        cy + Math.sin(angle) * dotR,
        1.5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(16, 185, 129, 0.6)";
      ctx.fill();
    }

    timeRef.current += 0.016;
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const size = Math.min(window.innerWidth * 0.65, window.innerHeight * 0.65, 500);
      canvas.width = size * 2; // 2x for retina
      canvas.height = size * 2;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="relative z-10" />;
}

// ─── Main LoadingScreen ─────────────────────────────────────────
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"lens" | "logo" | "done">("lens");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"), 3500);
    const t2 = setTimeout(() => {
      setPhase("done");
      setTimeout(onComplete, 600);
    }, 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  // Ball visual for logo
  const BallGlyph = () => (
    <div className="w-[0.72em] h-[0.72em] rounded-full border-[4px] md:border-[5px] border-emerald-500 bg-transparent shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center">
      <div
        className="absolute w-[80%] h-[2px] rounded-full bg-emerald-500/35"
        style={{ transform: "rotate(-25deg)" }}
      />
      <div
        className="absolute w-[2px] h-[80%] rounded-full bg-emerald-500/25"
        style={{ transform: "rotate(-25deg)" }}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#0d1117] overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* ── Lens HUD Phase ── */}
          <AnimatePresence>
            {phase === "lens" && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                exit={{
                  scale: 0,
                  opacity: 0,
                  filter: "blur(20px)",
                }}
                transition={{ duration: 0.5, ease: "easeIn" }}
              >
                {/* Subtle grid bg */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                <CameraLens />

                {/* "LOADING DATA" text below lens */}
                <motion.div
                  className="absolute bottom-[15%] text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-white/40 uppercase font-mono">
                    <motion.div
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    Analyzing Impact Data
                    <motion.div
                      className="w-1.5 h-1.5 bg-red-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Logo Phase ── */}
          <AnimatePresence>
            {phase === "logo" && (
              <motion.div
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0d1117]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none">
                  <motion.span
                    initial={{ opacity: 0, x: -40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  >
                    IMPACT&nbsp;HER
                  </motion.span>

                  <motion.div
                    className="inline-flex items-center justify-center mx-[0.02em]"
                    initial={{
                      scale: 5,
                      rotate: 720,
                      opacity: 0,
                      filter: "blur(6px)",
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 150,
                      delay: 0.05,
                    }}
                  >
                    <BallGlyph />
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  >
                    S
                  </motion.span>
                </div>

                <motion.div
                  className="mt-5 h-[3px] bg-emerald-500 rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 160, opacity: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />

                {/* Light sweep */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.04) 48%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 52%, transparent 65%)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
