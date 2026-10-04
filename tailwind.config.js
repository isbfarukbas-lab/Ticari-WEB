/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resto: {
          bg: '#FBFBFC',
          card: '#FFFFFF',
          dark: '#0A0A0B',
          gray: '#64748B',
          lightGray: '#F1F3F5',
          border: '#E2E4E8',
          accent: '#0A0A0B',
          hover: '#262626',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
