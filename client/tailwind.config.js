/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1B3A5C',
      },
      fontSize: {
        base13: '13px',
        label12: '12px',
      },
    },
  },
  plugins: [],
};
