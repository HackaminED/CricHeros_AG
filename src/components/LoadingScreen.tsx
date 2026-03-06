"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

/*
 * Hybrid Loading Screen
 * ─────────────────────
 * Phase 1 (video):       Play real Virat Kohli footage — cinematic bat-ball impact.
 * Phase 2 (ball-flight): The video fades with a bright flash. A CSS-animated cricket
 *                         ball "continues" flying from where the real ball left off,
 *                         spinning and growing as it approaches the camera.
 * Phase 3 (logo):        The ball decelerates and shrinks into position as the "O"
 *                         inside the word "IMPACT HEROS". Text slides in around it.
 * Phase 4 (done):        Fade out to dashboard.
 */

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<
    "video" | "ball-flight" | "logo" | "done"
  >("video");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("ball-flight"), 2500);
    const t2 = setTimeout(() => setPhase("logo"), 4500);
    const t3 = setTimeout(() => {
      setPhase("done");
      setTimeout(onComplete, 600);
    }, 6200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Ball visual component (shared between flight and logo)
  const BallVisual = ({ isLogo }: { isLogo: boolean }) => (
    <div
      className={`relative flex items-center justify-center rounded-full transition-all duration-700 ${
        isLogo
          ? "w-[0.75em] h-[0.75em] border-[4px] md:border-[6px] border-emerald-500 bg-transparent shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          : "w-[0.75em] h-[0.75em] bg-gradient-to-br from-red-700 via-red-800 to-red-950 shadow-[inset_-4px_-4px_12px_rgba(0,0,0,0.6),0_0_25px_rgba(200,0,0,0.25)]"
      }`}
    >
      {/* Primary seam */}
      <div
        className={`absolute w-[85%] h-[2.5px] rounded-full transition-colors duration-700 ${
          isLogo ? "bg-emerald-500/40" : "bg-yellow-100/60"
        }`}
        style={{ transform: "rotate(-25deg)" }}
      />
      {/* Cross seam */}
      <div
        className={`absolute w-[2.5px] h-[85%] rounded-full transition-colors duration-700 ${
          isLogo ? "bg-emerald-500/25" : "bg-yellow-100/40"
        }`}
        style={{ transform: "rotate(-25deg)" }}
      />
      {/* Shine highlight (ball only) */}
      {!isLogo && (
        <div className="absolute top-[15%] right-[20%] w-[20%] h-[20%] bg-white/15 rounded-full blur-[2px]" />
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 bg-black overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* ── LAYER 1: Real Video ── */}
          <motion.div
            className="absolute inset-0 z-10"
            animate={{
              opacity: phase === "video" ? 1 : 0,
              scale: phase === "video" ? 1 : 1.1,
              filter:
                phase === "video"
                  ? "brightness(0.85) blur(0px)"
                  : "brightness(3) blur(15px)",
            }}
            transition={{
              duration: phase === "video" ? 0 : 0.4,
              ease: "easeOut",
            }}
          >
            <video
              ref={videoRef}
              src="/cinematic_swing.mp4"
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Cinematic vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.75) 100%)",
              }}
            />
          </motion.div>

          {/* ── LAYER 2: Ball Flight (ONLY during flight phase) ── */}
          <AnimatePresence>
            {phase === "ball-flight" && (
              <motion.div className="absolute inset-0 z-20 flex items-center justify-center">
                {/* Dark bg fade in */}
                <motion.div
                  className="absolute inset-0 bg-[#0a0a0a]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 1.2 }}
                />

                {/* Flying ball */}
                <motion.div
                  className="relative z-30 text-[80px] md:text-[120px]"
                  initial={{
                    x: 250,
                    y: -200,
                    scale: 0.4,
                    rotate: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: 0,
                    y: 20,
                    scale: 4,
                    rotate: 900,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    transition: { duration: 0.2 },
                  }}
                  transition={{
                    duration: 2,
                    ease: [0.22, 0.68, 0.36, 1],
                  }}
                >
                  <BallVisual isLogo={false} />
                </motion.div>

                {/* Trailing particles */}
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-amber-400/50 rounded-full"
                      style={{
                        top: `${30 + Math.random() * 40}%`,
                        left: `${45 + Math.random() * 15}%`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 0.7, 0],
                        scale: [0, 2, 0],
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400,
                      }}
                      transition={{
                        duration: 1.2 + Math.random(),
                        delay: i * 0.12,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── LAYER 3: Logo Phase (ball is INSIDE the text flow) ── */}
          <AnimatePresence>
            {phase === "logo" && (
              <motion.div
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0a]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none">
                  {/* "IMPACT HER" */}
                  <motion.span
                    initial={{ opacity: 0, x: -40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  >
                    IMPACT&nbsp;HER
                  </motion.span>

                  {/* The Ball as the "O" — lives INSIDE the text flex */}
                  <motion.div
                    className="inline-flex items-center justify-center mx-[0.02em]"
                    initial={{ scale: 5, rotate: 720, opacity: 0, filter: "blur(6px)" }}
                    animate={{ scale: 1, rotate: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 150,
                      delay: 0.05,
                    }}
                  >
                    <BallVisual isLogo={true} />
                  </motion.div>

                  {/* "S" */}
                  <motion.span
                    initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  >
                    S
                  </motion.span>
                </div>

                {/* Emerald accent line */}
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

                {/* Subtle cinematic light sweep */}
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
