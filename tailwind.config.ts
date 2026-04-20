import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D1B3E',
          dark: '#081022',
          light: '#1a2d5a',
        },
        gold: {
          DEFAULT: '#C9973A',
          light: '#D4A843',
          warm: '#E8B86D',
        },
        cream: {
          DEFAULT: '#F7F4F0',
          dark: '#EDE9E3',
        },
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      gridTemplateColumns: {
        'sidebar': '220px 1fr',
        'sidebar-collapsed': '56px 1fr',
      },
    },
  },
  plugins: [],
}

export default config
