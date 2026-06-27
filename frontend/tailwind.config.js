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
          dark: '#1d1310', // Deep chocolate/black from the logo
          gold: '#ca9d5d', // Metallic champagne gold from the logo
          pink: '#e59a93', // Rose gold/soft pink frosting from the logo
          cream: '#fffdfb', // Premium soft white/cream background
          slate: '#352e2c', // Complementary warm gray text
        },
        bakery: {
          50: '#fffdfb',
          100: '#fdf6f2',
          200: '#fbe7de',
          300: '#f8d1c5',
          400: '#f2a696',
          500: '#e59a93', // brand.pink
          600: '#d07c74',
          700: '#a3554e',
          800: '#7a3e39',
          900: '#532a26',
          950: '#1d1310', // brand.dark
        }
      }
    },
  },
  plugins: [],
}
