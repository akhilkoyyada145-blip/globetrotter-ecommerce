/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#111827',      // Charcoal (for text/headers)
        accent: '#14B8A6',       // Teal (for CTA buttons)
        secondary: '#99F6E4',    // Light teal (for accents)
      }
    },
  },
  plugins: [],
}