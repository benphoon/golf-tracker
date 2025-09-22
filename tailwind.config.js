/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'golf-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'golf-sand': {
          50: '#fefbf0',
          100: '#fef7e0',
          200: '#fdecc0',
          300: '#fbdd94',
          400: '#f8cc66',
          500: '#f5b742',
          600: '#ea9d28',
          700: '#cd8420',
          800: '#a6691f',
          900: '#86551e',
        }
      },
      fontFamily: {
        'sans': ['system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}