/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E3F2FD',
          DEFAULT: '#2196F3',
          dark: '#1976D2',
        },
        success: {
          light: '#C8E6C9',
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
        },
        highlight: '#FFB74D',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: '16px',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};