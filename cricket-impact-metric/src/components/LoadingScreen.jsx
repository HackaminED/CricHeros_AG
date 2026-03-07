import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
 * Loading Screen – Video Intro → Logo Reveal
 * ────────────────────────────────────────────
 * Phase 1 (video):  Plays /intro.mp4 full-screen.
 * Phase 2 (logo):   The classic IMPACT HEROS ball-to-logo animation.
 * Phase 3 (done):   Fade out to dashboard.
 */

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase] = useState("video");
  const videoRef = useRef(null);

  const goToLogo = () => {
    if (phase === "video") setPhase("logo");
  };

  // Logo phase lasts ~2.5 seconds then fades out
  useEffect(() => {
    if (phase === "logo") {
      const t = setTimeout(() => {
        setPhase("done");
        setTimeout(onComplete, 600);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  // Fallback: if video fails or takes too long, skip to logo after 15s
  useEffect(() => {
    const fallback = setTimeout(() => {
      if (phase === "video") goToLogo();
    }, 15000);
    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Shared ball visual (re-used from original) ──
  const BallVisual = ({ isLogo }) => (
    <div
      className={`relative flex items-center justify-center rounded-full transition-all duration-700 ${
        isLogo
          ? "w-[0.75em] h-[0.75em] border-[4px] md:border-[6px] border-emerald-500 bg-transparent shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          : "w-[0.75em] h-[0.75em] bg-gradient-to-br from-red-700 via-red-800 to-red-950 shadow-[inset_-4px_-4px_12px_rgba(0,0,0,0.6),0_0_25px_rgba(200,0,0,0.25)]"
      }`}
    >
      <div
        className={`absolute w-[85%] h-[2.5px] rounded-full transition-colors duration-700 ${
          isLogo ? "bg-emerald-500/40" : "bg-yellow-100/60"
        }`}
        style={{ transform: "rotate(-25deg)" }}
      />
      <div
        className={`absolute w-[2.5px] h-[85%] rounded-full transition-colors duration-700 ${
          isLogo ? "bg-emerald-500/25" : "bg-yellow-100/40"
        }`}
        style={{ transform: "rotate(-25deg)" }}
      />
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
          {/* ── Video Phase ── */}
          <AnimatePresence>
            {phase === "video" && (
              <motion.div
                className="absolute inset-0"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <video
                  ref={videoRef}
                  src="/intro.mp4"
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  onEnded={goToLogo}
                />

                {/* Gradient over bottom for skip button */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

                {/* Skip Button */}
                <motion.button
                  onClick={goToLogo}
                  className="absolute bottom-5 right-5 px-14 py-5 rounded-2xl text-lg font-bold text-white bg-black border border-white/30 hover:bg-gray-900 transition-all duration-300 z-20 shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Skip Intro →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Logo Phase ── */}
          <AnimatePresence>
            {phase === "logo" && (
              <motion.div
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0a]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
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
                    <BallVisual isLogo={true} />
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

                {/* Shine sweep */}
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
