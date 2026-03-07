import React from 'react';

const CATEGORY_STYLES = {
  'Match Winner': { bg: '#FF6700', text: 'white' },
  'High Impact': { bg: 'rgba(0, 78, 152, 0.15)', text: '#004E98' },
  'Neutral': { bg: 'rgba(58, 110, 165, 0.12)', text: '#3A6EA5' },
  'Low Impact': { bg: 'rgba(192, 192, 192, 0.20)', text: '#5A5A5A' },
  'Poor Impact': { bg: 'rgba(255, 103, 0, 0.12)', text: '#B33A00' },
};

export default function CategoryBadge({ category }) {
  const style = CATEGORY_STYLES[category] || { bg: 'var(--surface-muted)', text: 'var(--text-primary)' };

  return (
    <span
      className="category-badge inline-flex items-center rounded-[999px] text-xs font-semibold"
      style={{
        padding: '4px 10px',
        background: style.bg,
        color: style.text,
      }}
    >
      {category || '—'}
    </span>
  );
}
