import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom font families — Bengali-first design
      fontFamily: {
        // "Noto Serif Bengali" for headings — gives newspaper/editorial feel
        'bengali-serif': ['var(--font-noto-serif-bengali)', 'serif'],
        // "Hind Siliguri" for body text — highly readable Bengali at small sizes
        'bengali-sans': ['var(--font-hind-siliguri)', 'sans-serif'],
        // "Playfair Display" for masthead/logo — adds prestige newspaper feel
        'display': ['var(--font-playfair)', 'serif'],
      },
      colors: {
        // Newspaper palette — deep inky blacks, warm paper whites, red accents
        ink: {
          DEFAULT: '#1a1a1a',
          light: '#333333',
          muted: '#666666',
        },
        paper: {
          DEFAULT: '#faf8f4',  // Warm off-white, like newsprint
          dark: '#f0ede6',
        },
        accent: {
          DEFAULT: '#c0392b',  // Bold editorial red
          dark: '#96281b',
          light: '#e74c3c',
        },
        divider: '#d4cec4',
      },
      // Newspaper-style typography scale
      fontSize: {
        'headline-xl': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-md': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.35', fontWeight: '600' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.75' }],
        'body-md': ['0.9375rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.65' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
      },
      // Spacing scale uses 4pt grid — tight like a real newspaper
      spacing: {
        'column': '1px',   // Classic column rule width
      },
      maxWidth: {
        'site': '1280px',
        'content': '760px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
