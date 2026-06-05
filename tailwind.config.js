/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-driven palette via CSS variables (see index.css [data-theme]).
        ink: {
          900: 'rgb(var(--ink-900) / <alpha-value>)', // app canvas
          800: 'rgb(var(--ink-800) / <alpha-value>)', // panels / title bar
          700: 'rgb(var(--ink-700) / <alpha-value>)', // cards / hover
          600: 'rgb(var(--ink-600) / <alpha-value>)', // hairline borders
          500: 'rgb(var(--ink-500) / <alpha-value>)', // input borders / dividers
          400: 'rgb(var(--ink-400) / <alpha-value>)' // muted lines
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
          dim: 'rgb(var(--accent-dim) / <alpha-value>)'
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
