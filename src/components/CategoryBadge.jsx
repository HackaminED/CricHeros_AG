import React from 'react';

const CATEGORY_STYLES = {
  'Match Winner': { bg: '#FF6700', text: 'white' },
  'High Impact': { bg: '#004E98', text: 'white' },
  'Neutral': { bg: '#6B7280', text: 'white' },
  'Low Impact': { bg: '#9CA3AF', text: '#1f2937' },
  'Poor Impact': { bg: '#DC2626', text: 'white' },
};

export default function CategoryBadge({ category }) {
  const style = CATEGORY_STYLES[category] || { bg: 'var(--surface-muted)', text: 'var(--text-primary)' };

  return (
    <span
      className="category-badge inline-flex items-center rounded-[999px] font-semibold"
      style={{
        fontSize: '12px',
        fontWeight: 600,
        padding: '4px 10px',
        background: style.bg,
        color: style.text,
      }}
    >
      {category || '—'}
    </span>
  );
}
