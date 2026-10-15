/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      colors: {
        paper: '#FFF8F0',
        ink: '#22262F',
        paint: {
          coral: '#FF6B6B',
          marigold: '#F7B32B',
          teal: '#2EC4B6',
          violet: '#7B61FF',
          sky: '#4EA8DE',
          rose: '#F075AA',
        },
      },
    },
  },
  plugins: [],
}
