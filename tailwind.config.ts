import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(222.2, 84%, 4.9%)',
        foreground: 'hsl(210, 40%, 98%)',
        muted: 'hsl(217.2, 32.6%, 17.5%)',
        primary: {
          DEFAULT: 'hsl(221.2, 83.2%, 53.3%)',
          foreground: 'hsl(210, 40%, 98%)'
        },
        secondary: {
          DEFAULT: 'hsl(217.2, 32.6%, 17.5%)',
          foreground: 'hsl(210, 40%, 98%)'
        }
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px'
      }
    }
  },
  plugins: []
} satisfies Config
