/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#FAFAFA',
        muted: '#F3F4F6',
        navy: {
          DEFAULT: '#1A3A5C',
          hover: '#15304D',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#F5ECD7',
          hover: '#B5955D', // Slightly darker for hover
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 8px 24px rgba(0,0,0,0.10)',
        nav: '0 1px 0 #E5E7EB',
      },
      transitionDuration: {
        '200': '200ms',
        '650': '650ms',
      },
      transitionTimingFunction: {
        'ease': 'ease',
        'ease-out': 'ease-out',
      },
    },
  },
  plugins: [],
}
