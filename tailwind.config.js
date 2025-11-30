/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "text-primary": "rgb(11, 11, 11)",
        "text-secondary": "rgb(80, 80, 80)",
        "bg-gradient-light": "rgb(245, 247, 255)",
        "highlight-dark": "rgb(20, 5, 51)",
        "highlight-light1": "rgb(244, 237, 255)",
        "highlight-gradient2": "rgb(252, 235, 239)",
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

