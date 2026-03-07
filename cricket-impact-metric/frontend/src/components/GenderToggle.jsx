import React from 'react';
import { useGender } from '../context/GenderContext';

export default function GenderToggle() {
  const { gender, toggleGender } = useGender();

  return (
    <div
      className="flex rounded-[var(--radius-lg)] p-1 gap-0"
      style={{
        background: 'var(--surface-muted)',
        boxShadow: 'var(--shadow-soft)',
      }}
      role="group"
      aria-label="Toggle gender: men or women"
    >
      <button
        type="button"
        onClick={() => toggleGender('Men')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[var(--radius-lg)] text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(0,78,152,0.5)] ${
          gender === 'Men'
            ? 'bg-[var(--accent)] text-white shadow-soft'
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
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[var(--radius-lg)] text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(0,78,152,0.5)] ${
          gender === 'Women'
            ? 'bg-[var(--accent-strong)] text-white shadow-soft'
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
