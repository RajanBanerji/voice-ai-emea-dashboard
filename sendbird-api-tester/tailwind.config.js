/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0D0A1C',
          card: '#16132D',
          border: '#2E2A52',
          hover: '#1E1A3A',
        },
        sb: {
          purple: '#742DDD',
          'purple-dark': '#6211C8',
          'purple-light': '#8B5CF6',
          'purple-glow': '#9B6DFF',
          surface: '#252145',
          'surface-hover': '#332E5C',
        },
        method: {
          get: '#3B82F6',
          post: '#22C55E',
          put: '#F59E0B',
          delete: '#EF4444',
          patch: '#A78BFA',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
