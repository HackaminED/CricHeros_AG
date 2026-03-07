import React from 'react';

/**
 * Horizontal scrolling marquee of text items.
 * @param {string[]} texts - Array of strings to scroll
 * @param {number} velocity - Scroll speed (pixels per second, positive = left)
 * @param {string} className - Optional class for the wrapper
 */
export default function ScrollVelocity({ texts = [], velocity = 50, className = '' }) {
  const content = (texts || []).flatMap((t) => [t, '\u00A0\u00A0•\u00A0\u00A0']);
  const duplicated = [...content, ...content];

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden>
      <div
        className="inline-flex items-center gap-8"
        style={{
          animation: `scroll-velocity ${Math.max(15, 60 - Math.abs(velocity) * 0.5)}s linear infinite`,
        }}
      >
        {duplicated.map((item, i) => (
          <span key={i} className="text-2xl md:text-4xl font-black tracking-tighter text-white/90 uppercase">
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scroll-velocity {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
