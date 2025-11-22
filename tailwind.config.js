/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",      // ✅ App Router pages
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // ✅ Components
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",     // ✅ If using /pages
  ],
  theme: {
    extend: {
      fontFamily: {
        'dm-sans': ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        'geist-sans': ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        'geist-mono': ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#8B5E3C',
          50: '#faf7f5',
          100: '#f0e8e2',
          200: '#e1d0c3',
          300: '#cdaf9a',
          400: '#b98a72',
          500: '#a86f56',
          600: '#8B5E3C', // Your main color
          700: '#704a31',
          800: '#5b3c29',
          900: '#4b3224',
        }
      },
      tracking: {
        'wide': '0.025em',
        'wider': '0.05em',
      }
    },
  },
  plugins: [],
}