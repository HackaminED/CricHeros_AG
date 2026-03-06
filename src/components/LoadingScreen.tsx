"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'video' | 'logo' | 'done'>('video');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // We will transition to the logo after 3.8 seconds which is roughly when the ball leaves the frame
    // in the cinematic video.
    const transitionTimer = setTimeout(() => {
      setPhase('logo');
    }, 3800);

    const completeTimer = setTimeout(() => {
      setPhase('done');
      setTimeout(onComplete, 800);
    }, 6000);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Phase 1: Realistic Video playback */}
          <AnimatePresence>
            {phase === 'video' && (
              <motion.div 
                className="absolute inset-0 w-full h-full"
                exit={{ opacity: 0, scale: 1.1, filter: "brightness(2)" }} // Flash transition
                transition={{ duration: 0.4 }}
              >
                <video
                  ref={videoRef}
                  src="/cinematic_swing.mp4"
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Subtle dark vignette to make the transition and text later look better */}
                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 2: Logo Crash */}
          <AnimatePresence>
            {phase === 'logo' && (
              <motion.div
                className="flex flex-col items-center justify-center relative z-10 w-full h-full bg-[#0a0a0a]"
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }} // hard crash
              >
                <div className="flex items-center text-5xl md:text-7xl lg:text-8xl font-sans font-black tracking-tighter text-white">
                  <span>IMPACT HER</span>
                  
                  {/* The Ball forming 'O' */}
                  <div className="relative flex items-center justify-center mx-1 md:mx-2 w-[0.8em] h-[0.8em]">
                    <motion.div
                      className="absolute inset-0 rounded-full border-[6px] md:border-[10px] border-emerald-500 shadow-xl"
                      initial={{ scale: 3, opacity: 0, rotate: -180 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    />
                    {/* The Seam of the ball */}
                    <motion.div 
                      className="absolute w-full h-1 bg-emerald-500/50 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    />
                  </div>

                  <span>S</span>
                </div>
                
                <motion.div
                  className="mt-6 h-1 bg-emerald-500 rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "200px", opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
