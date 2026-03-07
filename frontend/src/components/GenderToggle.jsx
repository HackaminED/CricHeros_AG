import React from 'react';
import { useGender } from '../context/GenderContext';

export default function GenderToggle() {
  const { gender, toggleGender } = useGender();

  return (
    <div
      className="flex rounded-xl p-1 gap-0"
      style={{
        background: 'var(--surface-muted)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
      }}
      role="group"
      aria-label="Toggle gender: men or women"
    >
      <button
        type="button"
        onClick={() => toggleGender('Men')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
          gender === 'Men'
            ? 'bg-[var(--accent)] text-white shadow-md'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        aria-pressed={gender === 'Men'}
        aria-label="Show men's data"
      >
        <span aria-hidden>♂</span> Men
      </button>
      <button
        type="button"
        onClick={() => toggleGender('Women')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
          gender === 'Women'
            ? 'bg-[var(--accent-strong)] text-white shadow-md'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        aria-pressed={gender === 'Women'}
        aria-label="Show women's data"
      >
        <span aria-hidden>♀</span> Women
      </button>
    </div>
  );
}
