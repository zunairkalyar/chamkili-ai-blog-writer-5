/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'chamkili-primary': '#C57F5D',
        'chamkili-secondary': '#D18F70',
        'chamkili-bg': '#FFFBF5',
        'chamkili-text': '#3D2C21'
      }
    },
  },
  plugins: [],
}
