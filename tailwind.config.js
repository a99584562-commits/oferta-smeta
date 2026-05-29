/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          900: '#0B0E0A',
          800: '#1A1D17',
          700: '#2A2E27',
          500: '#5C6359',
          400: '#7C8278',
          300: '#A3A89E',
          200: '#D4D7CF',
          100: '#E8EBE3',
        },
        surface: {
          0: '#FAFBF7',
          50: '#F4F6EF',
          100: '#FFFFFF',
          200: '#EEF1E8',
        },
        lime: {
          50: '#F2FBE0',
          100: '#E4F7BD',
          200: '#CFEF8C',
          300: '#B6E55B',
          400: '#9BD730',
          500: '#7FBE1A',
          600: '#5F9512',
          700: '#456E0F',
        },
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgba(20, 24, 16, 0.04), 0 0 0 1px rgba(20,24,16,0.03)',
        'soft': '0 1px 2px rgba(20, 24, 16, 0.04), 0 8px 24px -8px rgba(20, 24, 16, 0.08)',
        'soft-lg': '0 2px 4px rgba(20,24,16,0.04), 0 24px 48px -12px rgba(20,24,16,0.12)',
        'inset-hairline': 'inset 0 1px 0 rgba(255,255,255,0.7)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'silk': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
