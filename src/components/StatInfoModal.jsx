import React, { useEffect } from 'react';

export default function StatInfoModal({ isOpen, onClose, title, content }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stat-info-modal-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
      <div
        className="relative rounded-2xl max-w-md w-full p-6 focus:outline-none dark-no-border animate-page-enter"
        style={{ background: 'var(--surface-card)', boxShadow: 'var(--shadow-strong)', border: '1px solid var(--glass-border)' }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="stat-info-modal-title" className="font-display font-bold text-lg text-[var(--text-primary)] mb-2">
              {title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{content}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
