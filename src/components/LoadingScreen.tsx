"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'swing' | 'flight' | 'logo'>('swing');

  useEffect(() => {
    // Timing sequence for the animation
    const swingTimer = setTimeout(() => setPhase('flight'), 1200);
    const flightTimer = setTimeout(() => setPhase('logo'), 2500);
    const completeTimer = setTimeout(() => onComplete(), 5000);

    return () => {
      clearTimeout(swingTimer);
      clearTimeout(flightTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      <AnimatePresence>
        
        {/* Phase 1 & 2: Batsman Setup and Ball Flight */}
        {phase !== 'logo' && (
          <motion.div 
            className="relative w-full h-full flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* The Batsman SVG */}
            <motion.div
              className="absolute bottom-10 left-10 md:left-32 origin-bottom-right"
              initial={{ rotate: 0 }}
              animate={phase === 'flight' ? { rotate: -60, x: -20 } : { rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
              <svg width="150" height="200" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Simplified Batsman Silhouette */}
                <path d="M50 30 C50 30 40 50 35 80 L45 140 M65 80 L55 140 M40 80 C40 80 50 70 65 75 M50 10 A10 10 0 1 1 50 29.9 A10 10 0 1 1 50 10" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                {/* The Bat */}
                <motion.path 
                  d="M60 60 L80 120 L85 118 L65 58 Z" 
                  fill="#f59e0b" 
                  initial={{ rotate: 0 }}
                  animate={phase === 'flight' ? { rotate: -120, x: -10, y: 40 } : { rotate: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            {/* The Ball */}
            <motion.div
              className="absolute w-6 h-6 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]"
              initial={{ x: '100vw', y: '50vh', scale: 1 }}
              animate={
                phase === 'swing' 
                  ? { x: '-20vw', y: '20vh' } // Incoming pitch (from right to left towards batsman)
                  : { x: '50vw', y: '-50vh', scale: 0.5, opacity: 0 } // Hit out of the park
              }
              transition={
                phase === 'swing'
                  ? { duration: 1.2, ease: "easeIn" }
                  : { duration: 1.3, ease: "easeOut" }
              }
            />
          </motion.div>
        )}

        {/* Phase 3: The Logo Reveal */}
        {phase === 'logo' && (
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center text-5xl md:text-7xl font-black tracking-tighter text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                IMPACT HER
              </span>
              
              {/* The "O" that drops in as a ball */}
              <motion.div
                className="relative inline-block w-[1em] h-[1em] mx-1 bg-red-500 rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(239,68,68,0.8)] border-2 border-red-600 flex items-center justify-center transform hover:rotate-180 transition-transform duration-1000"
                initial={{ y: -500, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.6, duration: 1.5 }}
              >
                {/* Ball Seam */}
                <div className="absolute w-full h-[2px] bg-red-900/40 rotate-45" />
                <div className="absolute w-full h-[2px] bg-red-900/40 -rotate-45" />
              </motion.div>

              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-emerald-400">
                S
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
