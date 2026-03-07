import React from 'react';
import { motion } from 'framer-motion';
import MatchPredictor from '../components/MatchPredictor';

export default function MatchPredictorPage() {
  return (
    <div className="animate-page-enter max-w-[1400px] mx-auto">
      <motion.header
        className="mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display font-bold text-[var(--text-primary)] text-3xl md:text-4xl tracking-tight">
          AI Match Predictor
        </h1>
        <p className="text-[var(--text-secondary)] mt-1.5 text-base max-w-2xl">
          Simulate incoming or hypothetical specific match scenarios to estimate the win probability using our trained Gradient Boosting model.
        </p>
      </motion.header>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MatchPredictor />
      </motion.div>
    </div>
  );
}
