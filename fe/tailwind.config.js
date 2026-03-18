/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main App
        primary: {
          DEFAULT: '#FFD60A',
          dark: '#E6C000',
        },
        // Workout Studio
        studio: {
          DEFAULT: '#FF4500',
          dark: '#CC3700',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        studio: ['Bebas Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}