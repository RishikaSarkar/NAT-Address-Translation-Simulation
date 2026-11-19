/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        network: {
          lan: '#3b82f6',     // Blue for Private LAN
          nat: '#10b981',     // Emerald/Green for NAT Router
          wan: '#6366f1',     // Indigo for Public Internet
          drop: '#ef4444',    // Red for Dropped
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
