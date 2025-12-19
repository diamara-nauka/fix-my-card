/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      keyframes: {
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'slide-down': 'slide-down 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-left': 'fade-in-left 0.8s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.8s ease-out forwards',
        'scale-in': 'scale-in 0.6s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.delay-100': { 'animation-delay': '0.1s' },
        '.delay-200': { 'animation-delay': '0.2s' },
        '.delay-300': { 'animation-delay': '0.3s' },
        '.delay-400': { 'animation-delay': '0.4s' },
        '.delay-500': { 'animation-delay': '0.5s' },
        '.delay-600': { 'animation-delay': '0.6s' },
        // Set initial state for animations to prevent flash
        '.animate-fade-in-up': { 'opacity': '0' },
        '.animate-fade-in-left': { 'opacity': '0' },
        '.animate-fade-in-right': { 'opacity': '0' },
        '.animate-scale-in': { 'opacity': '0' },
      }
      addUtilities(newUtilities)
    }
  ],

}