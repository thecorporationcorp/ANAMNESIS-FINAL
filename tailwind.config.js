/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blade Runner Cyberpunk Palette
        'cyber-cyan': '#00f0ff',
        'cyber-pink': '#ff00aa',
        'cyber-blue': '#0066ff',
        'cyber-purple': '#9900ff',
        'cyber-orange': '#ff6600',
        'cyber-red': '#ff0033',
        'cyber-green': '#00ff66',
        'cyber-yellow': '#ffff00',
        // Vintage Collage Palette
        'vintage-cream': '#f5f1e8',
        'vintage-sepia': '#d4a574',
        'vintage-brown': '#8b7355',
        'vintage-ink': '#2c1810',
        'vintage-red': '#991b1b',
        'vintage-blue': '#2563eb',
        'vintage-green': '#16a34a',
      },
      fontFamily: {
        'mono': ['Courier Prime', 'Courier New', 'monospace'],
        'script': ['Dancing Script', 'cursive'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'drift': 'drift 20s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.6)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, -10px)' },
          '50%': { transform: 'translate(-5px, 5px)' },
          '75%': { transform: 'translate(-10px, -5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
