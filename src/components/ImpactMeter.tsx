import React from "react";

export default function ImpactMeter({ score }: { score: number }) {
  // Normalize score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Circumference of half circle = pi * r
  const r = 40;
  const circum = Math.PI * r;
  const fill = (normalizedScore / 100) * circum;

  // Determine color based on score (50 is neutral)
  const getColor = (s: number) => {
    if (s < 40) return "#f43f5e"; // Rose 500 (Negative)
    if (s < 60) return "#f59e0b"; // Amber 500 (Neutral)
    return "#10b981"; // Emerald 500 (Positive/Impactful)
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-md shadow-xl">
      <h3 className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-4">
        Current Match Impact
      </h3>

      <div className="relative w-64 h-32 flex items-end justify-center overflow-hidden">
        {/* Background Arc */}
        <svg className="absolute top-0 w-full h-[200%]" viewBox="0 0 100 100">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Foreground Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={getColor(normalizedScore)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${fill} ${circum}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score Display */}
        <div
          className="absolute text-5xl font-black tabular-nums tracking-tighter"
          style={{ color: getColor(normalizedScore) }}
        >
          {normalizedScore.toFixed(1)}
        </div>
      </div>

      {/* Legend / Baseline markers */}
      <div className="flex justify-between w-full mt-4 px-4 text-xs font-semibold text-gray-500">
        <span>0 (Poor)</span>
        <span className="text-gray-400">50 (Neutral)</span>
        <span>100 (Match Winner)</span>
      </div>
    </div>
  );
}
