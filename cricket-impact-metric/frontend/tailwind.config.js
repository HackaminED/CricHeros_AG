/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004E98',
        secondary: '#3A6EA5',
        accent: '#FF6700',
        canvas: '#EBEBEB',
        muted: '#C0C0C0',
        'text-primary': '#0B1931',
        'text-secondary': '#334e70',
      },
      borderRadius: {
        sm: '12px',
        md: '18px',
        lg: '28px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 6px 8px rgba(58,110,165,0.12), inset 0 -6px 12px rgba(0,78,152,0.06)',
        strong: '0 8px 18px rgba(0,78,152,0.18), inset 0 -10px 18px rgba(58,110,165,0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'stat': ['36px', { lineHeight: '1.2' }],
        'stat-lg': ['48px', { lineHeight: '1.1' }],
      },
      maxWidth: {
        container: '1400px',
      },
      animation: {
        'gauge-fill': 'gaugeFill 1.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        gaugeFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--gauge-offset)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
