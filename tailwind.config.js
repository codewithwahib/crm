/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",      // ✅ App Router pages
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // ✅ Components
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",     // ✅ If using /pages
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
