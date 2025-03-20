/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4a6741',
        secondary: '#d4a373',
        'node-primary': '#d4a373',
        'node-in-progress': '#ffd166',
        'node-completed': '#a7c957',
        'node-abandoned': '#d1d1d1',
      },
    },
  },
  plugins: [],
} 