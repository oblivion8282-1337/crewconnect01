/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D9FF00',
          foreground: '#000000',
          muted: 'rgba(217, 255, 0, 0.15)',
        },
        secondary: {
          DEFAULT: '#FFFFFF',
          muted: '#8E8E93',
        },
        gray: {
          50: '#F9F9F9',
          100: '#EBEBEB',
          400: '#636366',
          700: '#2C2C2E',
          800: '#1C1C1E',
          900: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'h1': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'stat': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'body': ['0.875rem', { lineHeight: '1.25rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem' }],
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
        'header': '72px',
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '4px',
        'lg': '6px',
        'xl': '8px',
        '2xl': '10px',
        '3xl': '12px',
        'card': '6px',
        'full': '9999px',
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)',
        'card-gradient-light': 'linear-gradient(135deg, #FFFFFF 0%, #F9F9F9 100%)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-in-out',
      },
    },
  },
  plugins: [],
}
