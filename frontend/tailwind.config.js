/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f3eff6',
        'surface-container-low': '#f0eaf3',
        'surface-container-high': '#e6dfea',
        'surface-container-highest': '#ffffff',
        primary: '#6b5876',
        'primary-container': '#d3c5e0',
        'primary-dim': '#4e3b58',
        'on-surface': '#35293b',
        'on-surface-variant': '#5a4c62',
        error: '#a13b48',
        secondary: '#827485',
        'secondary-container': '#e3d6e5',
        tertiary: '#ac7282',
        'tertiary-container': '#f6dde3',
        'outline-variant': '#cbbec9',
        'surface-tint': '#6b5876',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
      },
      boxShadow: {
        'ambient-float': '0 40px 40px -15px rgba(53, 41, 59, 0.04), 0 10px 10px -5px rgba(107, 88, 118, 0.06)',
        'neomorphic-inset': 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
