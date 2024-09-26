/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        k24kurdish: ['K24KurdishBold', 'sans-serif'],
        nrt: ['NRT', 'sans-serif']
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}
