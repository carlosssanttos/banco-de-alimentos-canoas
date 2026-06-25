/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8f4fd',
          100: '#c6e3f8',
          200: '#8dc4f0',
          300: '#54a5e8',
          400: '#2b8bd4',
          500: '#1a72b8',
          600: '#1a5e8a',
          700: '#154d72',
          800: '#103c59',
          900: '#0b2b40',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card:    '#ffffff',
          border:  '#e2e8f0',
          muted:   '#f1f5f9',
        },
        status: {
          danger:  '#dc2626',
          warning: '#d97706',
          success: '#16a34a',
          info:    '#1a72b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}