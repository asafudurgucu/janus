/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Refined, low-chroma dark palette (Linear/Vercel-grade)
        ink: {
          900: '#0a0b0d', // app canvas
          800: '#0f1113', // panels / title bar
          700: '#141619', // cards / hover
          600: '#1d2024', // hairline borders
          500: '#272b31', // input borders / dividers
          400: '#3a4048' // muted lines
        },
        accent: {
          DEFAULT: '#6366f1', // indigo
          soft: '#818cf8',
          dim: '#4f46e5'
        },
        good: '#34d399',
        warn: '#fbbf24',
        bad: '#fb5d6b'
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
}
