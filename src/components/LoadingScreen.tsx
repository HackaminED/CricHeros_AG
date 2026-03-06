"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  // Cinematic sequence phases
  // 'intro': Close up zoom on batsman
  // 'impact': Flash and camera shake
  // 'ball-flight': Ball launches from batsman towards screen
  // 'logo-snap': Ball lands in the exact spot of the "O"
  // 'done': Animation finished
  const [phase, setPhase] = useState<'intro' | 'impact' | 'ball-flight' | 'logo-snap' | 'done'>('intro');

  useEffect(() => {
    // Timing matches a classic movie trailer beat
    const impactTimer = setTimeout(() => setPhase('impact'), 1800); 
    const flightTimer = setTimeout(() => setPhase('ball-flight'), 2100); 
    const snapTimer = setTimeout(() => setPhase('logo-snap'), 3200);

    const completeTimer = setTimeout(() => {
      setPhase('done');
      setTimeout(onComplete, 800);
    }, 5500);

    return () => {
      clearTimeout(impactTimer);
      clearTimeout(flightTimer);
      clearTimeout(snapTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden font-sans"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Background overlay (Darkens as logo approaches) */}
          <motion.div 
            className="absolute inset-0 z-0 bg-[#0a0a0a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'logo-snap' ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Phase 1 & 2: The Batsman & Impact (2.5D Parallax) */}
          <AnimatePresence>
            {(phase === 'intro' || phase === 'impact') && (
              <motion.div 
                className="absolute inset-0 w-full h-full z-10"
                initial={{ filter: "brightness(0.5)" }}
                animate={{ filter: phase === 'impact' ? "brightness(2) contrast(1.5)" : "brightness(0.9) contrast(1.1)" }}
                exit={{ opacity: 0, scale: 1.2, filter: "brightness(3) blur(10px)" }} 
                transition={{ duration: phase === 'impact' ? 0.1 : 3, ease: "easeOut" }}
              >
                {/* Micro zoom push */}
                <motion.div
                  className="relative w-full h-full"
                  initial={{ scale: 1.05, x: 0, y: 0 }}
                  animate={{ 
                    scale: phase === 'impact' ? 1.15 : 1.12,
                    x: phase === 'impact' ? [0, -10, 10, -5, 5, 0] : 0, // Camera shake on impact
                    y: phase === 'impact' ? [0, 10, -10, 5, -5, 0] : 0
                  }}
                  transition={{ 
                    scale: { duration: phase === 'impact' ? 0.2 : 2.5, ease: "easeIn" },
                    x: { duration: 0.3 },
                    y: { duration: 0.3 }
                  }}
                >
                  <Image 
                    src="/cinematic-batsman.png" 
                    alt="Cinematic Batsman"
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  
                  {/* Dust particles simulated with small divs during impact */}
                  {phase === 'impact' && (
                    <div className="absolute inset-0 flex justify-center items-center">
                       {Array.from({ length: 20 }).map((_, i) => (
                         <motion.div
                           key={i}
                           className="absolute w-2 h-2 bg-yellow-100 rounded-full blur-[1px]"
                           initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                           animate={{ 
                             x: (Math.random() - 0.5) * 500, 
                             y: (Math.random() - 0.5) * 500,
                             opacity: 0,
                             scale: Math.random() * 3
                           }}
                           transition={{ duration: 0.8, ease: "easeOut" }}
                         />
                       ))}
                    </div>
                  )}
                  
                </motion.div>
                
                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80 pointer-events-none" style={{ background: 'radial-gradient(circle, transparent 20%, #000 90%)'}} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3: The Ball Flight (3D perspective scaling) */}
          <AnimatePresence>
            {(phase === 'ball-flight' || phase === 'logo-snap') && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                {/* The Cricket Ball */}
                <motion.div
                  className="relative z-30"
                  initial={{ scale: 0, z: -1000, y: 200, x: -100, rotate: 0, filter: "blur(10px)", opacity: 0 }}
                  animate={phase === 'logo-snap' ? {
                    scale: 1, // End at logo scale
                    z: 0,
                    y: 0,
                    x: 0,
                    rotate: 1080, // Heavy spin
                    filter: "blur(0px)",
                    opacity: 1
                  } : {
                    scale: 15, // Giant in middle of flight
                    z: 500,
                    y: -50,
                    x: 50,
                    rotate: 540,
                    filter: "blur(4px)",
                    opacity: 1
                  }}
                  transition={phase === 'logo-snap' ? {
                    duration: 0.6, type: "spring", damping: 15, stiffness: 100
                  } : {
                    duration: 1.1, ease: "circIn"
                  }}
                >
                  {/* Visual construction of the ball/logo O */}
                  <div className={`flex items-center justify-center w-[0.8em] h-[0.8em] rounded-full text-7xl md:text-8xl transition-all duration-300 ${phase === 'logo-snap' ? 'border-[10px] border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-transparent' : 'bg-red-700 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_0_50px_rgba(255,0,0,0.5)]'}`}>
                    {/* Seam transforms into logo line */}
                    <motion.div 
                      className={`absolute w-full h-[5%] rounded-full transition-colors duration-500 ${phase === 'logo-snap' ? 'bg-emerald-500/50' : 'bg-white/80'}`}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 4: Logo Text Reveal (Ball is already in position 'O' from phase 3) */}
          <AnimatePresence>
            {phase === 'logo-snap' && (
              <motion.div
                className="flex flex-col items-center justify-center absolute z-20 w-full h-full"
              >
                <div className="flex items-center text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
                  <motion.span
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  >
                    IMPACT HER
                  </motion.span>
                  
                  {/* Invisible spacer for the "O" (The actual animating ball sits exactly here via absolute positioning relative to center, but we use a spacer here to push 'S' correctly) */}
                  <div className="w-[0.8em] h-[0.8em] mx-1 md:mx-2 opacity-0"></div>

                  <motion.span
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                  >
                    S
                  </motion.span>
                </div>
                
                <motion.div
                  className="mt-6 h-1 bg-emerald-500 rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "200px", opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "circOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
