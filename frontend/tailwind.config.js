/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#cc4b25',
        secondary: '#e4a435',
        tertiary: '#f0e2c9',
        surface: '#f7f2ea',
        onSurface: '#3d1f17',
        darkSurface: '#4a241a',
        muted: '#6f5a52',
        forest: {
          DEFAULT: '#4a241a', // map forest to darkSurface/primary theme
          light: '#cc4b25',
          dark: '#3d1f17',
          50: '#f7f2ea',
          100: '#f0e2c9',
          200: '#e4a435',
          400: '#e4a435',
          500: '#cc4b25',
          600: '#4a241a',
          700: '#3d1f17',
          800: '#2f1a13',
          900: '#1c100b',
        },
        gold: {
          DEFAULT: '#e4a435',
          light: '#f0e2c9',
          dark: '#cc4b25',
          50: '#faf8f5',
          100: '#f7f2ea',
          200: '#f0e2c9',
          400: '#e4a435',
          500: '#e4a435',
          600: '#cc4b25',
          700: '#4a241a',
          800: '#3d1f17',
        },
        cream: {
          DEFAULT: '#f7f2ea',
          50: '#ffffff',
          100: '#f7f2ea',
        },
        charcoal: '#3d1f17', // use the warm cocoa brown instead of harsh charcoal
      },
      fontFamily: {
        serif: ['Plus Jakarta Sans', 'sans-serif'], // use premium Plus Jakarta Sans instead of Playfair
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        accent: ['Caveat', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
