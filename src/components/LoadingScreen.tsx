"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'windup' | 'strike' | 'flight' | 'logo' | 'done'>('windup');

  useEffect(() => {
    // Elegant timing sequence
    const windupTimer = setTimeout(() => setPhase('strike'), 800);
    const flightTimer = setTimeout(() => setPhase('flight'), 1100);
    const logoTimer = setTimeout(() => setPhase('logo'), 2200);
    const completeTimer = setTimeout(() => {
      setPhase('done');
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 4500);

    return () => {
      clearTimeout(windupTimer);
      clearTimeout(flightTimer);
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] overflow-hidden"
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Subtle Background Grid/Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />

          <AnimatePresence>
            {/* Phase 1-3: The Abstract Strike & Flight */}
            {phase !== 'logo' && (
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* 1. The "Ball" (Data Node) approaching */}
                <motion.div
                  className="absolute w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.8)]"
                  initial={{ x: '100vw', y: '20vh', scale: 0.5, opacity: 0 }}
                  animate={
                    phase === 'windup' 
                      ? { x: '15vw', y: '5vh', scale: 1, opacity: 1 } // Approaching the strike zone
                      : phase === 'strike' 
                        ? { x: '0vw', y: '0vh', scale: 1.2, opacity: 1 } // Moment of impact
                        : { x: '-60vw', y: '-30vh', scale: 0.2, opacity: 0 } // Flying away
                  }
                  transition={{ 
                    duration: phase === 'windup' ? 0.8 : phase === 'strike' ? 0.1 : 1.2, 
                    ease: phase === 'flight' ? "easeOut" : "easeIn" 
                  }}
                />

                {/* 2. The "Strike" / Impact Flash */}
                {phase === 'strike' && (
                  <motion.div
                    className="absolute w-px h-[200vh] bg-linear-to-b from-transparent via-emerald-100 to-transparent shadow-[0_0_50px_rgba(255,255,255,0.8)]"
                    initial={{ opacity: 0, rotate: 25, scaleY: 0 }}
                    animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ left: '50%', transformOrigin: 'center' }}
                  />
                )}
                
                {/* Ripple Effect on Impact */}
                {phase === 'strike' && (
                  <motion.div
                    className="absolute w-32 h-32 rounded-full border-2 border-emerald-400/50"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                )}
              </div>
            )}

            {/* Phase 4: The Logo Reveal */}
            {phase === 'logo' && (
              <motion.div
                className="flex items-center justify-center relative z-10"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // smooth easeOut
              >
                <div className="flex items-center text-4xl md:text-6xl lg:text-7xl font-sans font-extrabold tracking-tight text-white">
                  <span className="text-gray-200">
                    IMPACT HER
                  </span>
                  
                  {/* The Abstract "O" dropping into place */}
                  <div className="relative flex items-center justify-center mx-1 md:mx-2 w-[0.8em] h-[0.8em]">
                    {/* The glowing ring of the O */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-[3px] md:border-[5px] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-gray-900/50 backdrop-blur-sm"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    />
                    
                    {/* The inner core (the "ball" from earlier) landing in the O */}
                    <motion.div
                      className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,1)]"
                      initial={{ y: -200, opacity: 0, scale: 0 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        damping: 15, 
                        stiffness: 100, 
                        mass: 0.8,
                        delay: 0.4
                      }}
                    />
                  </div>

                  <span className="text-gray-200">
                    S
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
