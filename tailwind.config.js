/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#EBECF0',
          canvas: '#EBECF0',
          card: '#EBECF0',
          base: '#EBECF0',
          dark: '#2B303C',
          text: '#2B303C',
          muted: '#555770',
          subtle: '#7C8293',
          border: 'rgba(255, 255, 255, 0.7)',
          shadowDark: 'rgba(166, 171, 189, 0.45)',
          shadowLight: 'rgba(255, 255, 255, 0.9)',
          coral: '#FF913A',
          'coral-hover': '#F88224',
          'coral-dark': '#E46E10',
        },
        clinical: {
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444',
          cyan: '#0ea5e9',
          teal: '#14b8a6',
          violet: '#8b5cf6',
          orange: '#FF913A',
        },
      },
      fontFamily: {
        poppins: ['"Poppins"', 'sans-serif'],
        roboto: ['"Roboto"', 'sans-serif'],
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Poppins"', '"Space Grotesk"', 'Roboto', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'neu-sm': '16px',
        'neu': '28px',
        'neu-card': '36px',
        'neu-pill': '50px',
      },
      boxShadow: {
        'neu-flat': '-8px -8px 16px rgba(255, 255, 255, 0.9), 8px 8px 16px rgba(166, 171, 189, 0.45)',
        'neu-flat-sm': '-4px -4px 8px rgba(255, 255, 255, 0.9), 4px 4px 8px rgba(166, 171, 189, 0.4)',
        'neu-flat-xs': '-2px -2px 6px rgba(255, 255, 255, 0.9), 2px 2px 6px rgba(166, 171, 189, 0.35)',
        'neu-inset': 'inset 4px 4px 8px rgba(166, 171, 189, 0.45), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
        'neu-inset-sm': 'inset 2px 2px 5px rgba(166, 171, 189, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.9)',
        'neu-inset-deep': 'inset 6px 6px 12px rgba(166, 171, 189, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.95)',
        'neu-orange': '-6px -6px 12px rgba(255, 255, 255, 0.8), 6px 6px 14px rgba(228, 110, 16, 0.35)',
        'neu-orange-sm': '-3px -3px 8px rgba(255, 255, 255, 0.8), 3px 3px 8px rgba(228, 110, 16, 0.3)',
      },
    },
  },
  plugins: [],
}
