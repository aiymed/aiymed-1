/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',   // Asosiy ko'k rang
        secondary: '#8B5CF6', // Qo'shimcha binafsha rang
      }
    },
  },
  plugins: [],
}