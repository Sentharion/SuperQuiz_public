/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: '#2563eb',
        background:'#0d1022',
        backgroundLight: '#0f172a',
        border: '#2f5aa6',
        borderHover: '#3b82f6',
        muted: '#94a3b8',
        chance: '#f5c200'
      }
    },
  },
  plugins: [],
}

