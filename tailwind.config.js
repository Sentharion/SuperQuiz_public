/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        background: '#0d1022',
        backgroundLight: '#0f172a',
        border: '#00D4E6',
        borderHover: '#02e2f5',
        borderDark: '#0097a7',
        muted: '#94a3b8',
        chance: '#f5c200',
        'lamp-on': '#22c55e',
        'lamp-on-border': '#4ade80',
        'lamp-off': '#052e16',
        'lamp-off-border': '#14532d',
      },
      borderColor: {
        'lamp-on': '#4ade80',
        'lamp-off': '#1b4228',
      },
    },
  },
  plugins: [],
}
